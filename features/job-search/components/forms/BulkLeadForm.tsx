"use client";

import { useState } from "react";

import { DEFAULT_LEAD_CHANNEL, DEFAULT_NEW_LEAD_STATUS } from "../../constants";
import {
  DuplicateLeadError,
  findLeadDuplicates,
  getAllLeads,
  type LeadDuplicate,
  type LeadInput,
} from "../../repositories/leadsRepository";
import type { Company } from "../../types";
import { CompanyCombobox } from "./CompanyCombobox";
import { FormActions, FormField } from "./FormFields";
import { LeadFields, type LeadFormValues } from "./LeadFields";

interface BulkLeadFormProps {
  companies: Company[];
  roleOptions: string[];
  onCreateCompany: (companyName: string) => Promise<Company>;
  onSubmit: (
    leads: LeadInput[],
    options: { allowNameDuplicates: boolean },
  ) => Promise<void>;
  onCancel: () => void;
}

interface BulkLeadRow {
  id: string;
  companyId: string;
  values: LeadFormValues;
  expanded: boolean;
}

interface RowErrors {
  company?: string;
  name?: string;
  contact?: string;
  duplicates?: LeadDuplicate[];
}

function emptyValues(): LeadFormValues {
  return {
    name: "",
    role: "",
    email: "",
    linkedin: "",
    xProfile: "",
    channel: DEFAULT_LEAD_CHANNEL,
    notes: "",
  };
}

function createRow(): BulkLeadRow {
  return {
    id: `${Date.now()}-${Math.random()}`,
    companyId: "",
    values: emptyValues(),
    expanded: true,
  };
}

function hasLeadValues(values: LeadFormValues): boolean {
  return Boolean(
    values.name.trim() ||
      values.role.trim() ||
      values.email.trim() ||
      values.linkedin.trim() ||
      values.xProfile.trim() ||
      values.notes.trim(),
  );
}

function isValidProfile(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function BulkLeadForm({
  companies,
  roleOptions,
  onCreateCompany,
  onSubmit,
  onCancel,
}: BulkLeadFormProps) {
  const [companyMode, setCompanyMode] = useState<"same" | "different">("same");
  const [sharedCompanyId, setSharedCompanyId] = useState("");
  const [rows, setRows] = useState<BulkLeadRow[]>([createRow(), createRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});
  const [confirmNameDuplicates, setConfirmNameDuplicates] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateRow = (id: string, update: (row: BulkLeadRow) => BulkLeadRow) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? update(row) : row)),
    );
    setRowErrors((current) => ({ ...current, [id]: {} }));
    setConfirmNameDuplicates(false);
    setShowNameWarning(false);
    setSaveError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);

    const populatedRows = rows.filter((row) => hasLeadValues(row.values));
    if (populatedRows.length === 0) {
      setSaveError("Add at least one lead before saving.");
      return;
    }

    const nextErrors: Record<string, RowErrors> = {};
    for (const row of populatedRows) {
      const errors: RowErrors = {};
      if (!row.values.name.trim()) errors.name = "Name is required.";
      if (companyMode === "same" ? !sharedCompanyId : !row.companyId) {
        errors.company = "Select or create a company.";
      }
      if (row.values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.values.email.trim())) {
        errors.contact = "Enter a valid email address.";
      } else if (
        !isValidProfile(row.values.linkedin) ||
        !isValidProfile(row.values.xProfile)
      ) {
        errors.contact = "Enter a valid LinkedIn and X profile URL.";
      }
      if (Object.keys(errors).length > 0) nextErrors[row.id] = errors;
    }

    if (Object.keys(nextErrors).length > 0) {
      setRowErrors(nextErrors);
      setRows((current) =>
        current.map((row) =>
          nextErrors[row.id] ? { ...row, expanded: true } : row,
        ),
      );
      return;
    }

    const candidates: LeadInput[] = populatedRows.map((row) => ({
      companyId: Number(
        companyMode === "same" ? sharedCompanyId : row.companyId,
      ),
      ...row.values,
      name: row.values.name.trim(),
      role: row.values.role.trim(),
      email: row.values.email.trim(),
      linkedin: row.values.linkedin.trim(),
      xProfile: row.values.xProfile.trim(),
      notes: row.values.notes.trim(),
      status: DEFAULT_NEW_LEAD_STATUS,
    }));
    const duplicates = findLeadDuplicates(candidates, await getAllLeads());
    const duplicatesByRow: Record<string, LeadDuplicate[]> = {};
    duplicates.forEach((duplicate) => {
      const row = populatedRows[duplicate.candidateIndex];
      duplicatesByRow[row.id] = [
        ...(duplicatesByRow[row.id] ?? []),
        duplicate,
      ];
    });

    const blockingDuplicates = duplicates.filter(
      (duplicate) => duplicate.isBlocking,
    );
    if (blockingDuplicates.length > 0) {
      setRowErrors(
        Object.fromEntries(
          Object.entries(duplicatesByRow).map(([rowId, rowDuplicates]) => [
            rowId,
            {
              duplicates: rowDuplicates,
              contact: rowDuplicates.some((duplicate) => duplicate.isBlocking)
                ? "Email or profile already exists for this company."
                : undefined,
            },
          ]),
        ),
      );
      setRows((current) =>
        current.map((row) =>
          duplicatesByRow[row.id] ? { ...row, expanded: true } : row,
        ),
      );
      return;
    }

    const nameDuplicates = duplicates.filter(
      (duplicate) => duplicate.field === "name",
    );
    if (nameDuplicates.length > 0 && !confirmNameDuplicates) {
      setRowErrors(
        Object.fromEntries(
          Object.entries(duplicatesByRow).map(([rowId, rowDuplicates]) => [
            rowId,
            { duplicates: rowDuplicates },
          ]),
        ),
      );
      setShowNameWarning(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(candidates, {
        allowNameDuplicates: confirmNameDuplicates,
      });
      onCancel();
    } catch (error) {
      if (error instanceof DuplicateLeadError) {
        const duplicatesByRow: Record<string, LeadDuplicate[]> = {};
        error.duplicates.forEach((duplicate) => {
          const row = populatedRows[duplicate.candidateIndex];
          duplicatesByRow[row.id] = [
            ...(duplicatesByRow[row.id] ?? []),
            duplicate,
          ];
        });
        setRowErrors(
          Object.fromEntries(
            Object.entries(duplicatesByRow).map(([rowId, rowDuplicates]) => [
              rowId,
              {
                duplicates: rowDuplicates,
                contact: rowDuplicates.some((duplicate) => duplicate.isBlocking)
                  ? "Email or profile already exists for this company."
                  : undefined,
              },
            ]),
          ),
        );
        setRows((current) =>
          current.map((row) =>
            duplicatesByRow[row.id] ? { ...row, expanded: true } : row,
          ),
        );
        if (error.duplicates.some((duplicate) => duplicate.field === "name")) {
          setShowNameWarning(true);
          setConfirmNameDuplicates(false);
        }
      }
      setSaveError(
        error instanceof Error ? error.message : "Failed to save leads.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Are these leads for the same company or different companies?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(["same", "different"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setCompanyMode(mode);
                setRowErrors({});
                setConfirmNameDuplicates(false);
                setShowNameWarning(false);
              }}
              aria-pressed={companyMode === mode}
              className={`rounded-lg border px-3 py-2 text-sm ${
                companyMode === mode
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
              }`}
            >
              {mode === "same" ? "Same company" : "Different companies"}
            </button>
          ))}
        </div>
      </fieldset>

      {companyMode === "same" ? (
        <FormField label="Company" required>
          <CompanyCombobox
            value={sharedCompanyId}
            onChange={(value) => {
              setSharedCompanyId(value);
              setRowErrors({});
              setConfirmNameDuplicates(false);
              setShowNameWarning(false);
            }}
            companies={companies}
            onCreateCompany={onCreateCompany}
          />
        </FormField>
      ) : null}

      <div className="space-y-3">
        {rows.map((row, index) => {
          const errors = rowErrors[row.id];
          const selectedCompany =
            companies.find(
              (company) =>
                String(company.id) ===
                (companyMode === "same" ? sharedCompanyId : row.companyId),
            )?.companyName ?? "Company not selected";
          const rowTitle =
            row.values.name.trim() || `Lead ${index + 1}`;

          return (
            <section
              key={row.id}
              className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={row.expanded}
                  onClick={() =>
                    updateRow(row.id, (current) => ({
                      ...current,
                      expanded: !current.expanded,
                    }))
                  }
                >
                  <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {rowTitle}
                  </span>
                  {companyMode === "different" ? (
                    <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {selectedCompany}
                    </span>
                  ) : null}
                </button>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`${row.expanded ? "Collapse" : "Expand"} ${rowTitle}`}
                    onClick={() =>
                      updateRow(row.id, (current) => ({
                        ...current,
                        expanded: !current.expanded,
                      }))
                    }
                    className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {row.expanded ? "Collapse" : "Expand"}
                  </button>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`Remove ${rowTitle}`}
                      onClick={() => {
                        setRows((current) =>
                          current.filter((entry) => entry.id !== row.id),
                        );
                        setRowErrors((current) => {
                          const next = { ...current };
                          delete next[row.id];
                          return next;
                        });
                      }}
                      className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {row.expanded ? (
                <div className="mt-4 space-y-4">
                  {companyMode === "different" ? (
                    <FormField label="Company" required>
                      <CompanyCombobox
                        value={row.companyId}
                        onChange={(value) =>
                          updateRow(row.id, (current) => ({
                            ...current,
                            companyId: value,
                          }))
                        }
                        companies={companies}
                        onCreateCompany={onCreateCompany}
                      />
                      {errors?.company ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.company}
                        </p>
                      ) : null}
                    </FormField>
                  ) : null}
                  <LeadFields
                    value={row.values}
                    onChange={(values) =>
                      updateRow(row.id, (current) => ({
                        ...current,
                        values,
                      }))
                    }
                    roleOptions={roleOptions}
                    nameRequired={false}
                    nameError={errors?.name}
                  />
                  {errors?.contact ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.contact}
                    </p>
                  ) : null}
                  {errors?.duplicates?.length ? (
                    <ul className="text-xs text-amber-700 dark:text-amber-300">
                      {errors.duplicates.map((duplicate, duplicateIndex) => (
                        <li key={`${duplicate.field}-${duplicateIndex}`}>
                          Matches {duplicate.existingName} by {duplicate.field}.
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {companyMode === "same" &&
      !sharedCompanyId &&
      Object.keys(rowErrors).length > 0 ? (
        <p className="text-xs text-red-600 dark:text-red-400">
          Select or create a company for this batch.
        </p>
      ) : null}

      {showNameWarning ? (
        <label className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
          <input
            type="checkbox"
            checked={confirmNameDuplicates}
            onChange={(event) =>
              setConfirmNameDuplicates(event.target.checked)
            }
          />
          Matching names may refer to different people. Submit anyway.
        </label>
      ) : null}

      {saveError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {saveError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setRows((current) => [...current, createRow()])}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        + Add another lead
      </button>
      <FormActions
        onCancel={onCancel}
        submitLabel="Save all"
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
