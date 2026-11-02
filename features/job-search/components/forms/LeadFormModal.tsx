"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  DEFAULT_LEAD_CHANNEL,
  DEFAULT_NEW_LEAD_STATUS,
} from "../../constants";
import { backfillLeadProfileFields } from "../../lib/leadProfileUtils";
import {
  canonicalizeLeadRole,
  getUniqueLeadRoles,
  type LeadInput,
} from "../../repositories/leadsRepository";
import { useLeadDraftStorage } from "../../hooks/useLeadDraftStorage";
import type { Company, Lead } from "../../types";
import { BulkLeadForm } from "./BulkLeadForm";
import { CompanyCombobox } from "./CompanyCombobox";
import { FormActions, FormField } from "./FormFields";
import { LeadFields, type LeadFormValues } from "./LeadFields";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  onSubmitBulk: (
    leads: LeadInput[],
    options: { allowNameDuplicates: boolean },
  ) => Promise<void>;
  lead?: Lead | null;
  companies: Company[];
  defaultCompanyId?: number;
  defaultChannel?: Lead["channel"];
  onCreateCompany: (companyName: string) => Promise<Company>;
}

interface LeadFormFieldsProps {
  lead?: Lead | null;
  companies: Company[];
  defaultCompanyId?: number;
  defaultChannel?: Lead["channel"];
  roleOptions: string[];
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  onCreateCompany: (companyName: string) => Promise<Company>;
}

interface SingleLeadDraft {
  companyId: string;
  values: LeadFormValues;
}

const SINGLE_LEAD_DRAFT_KEY = "job-search-lead-draft:single:v1";

function isLeadFormValues(value: unknown): value is LeadFormValues {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.role === "string" &&
    typeof record.email === "string" &&
    typeof record.linkedin === "string" &&
    typeof record.xProfile === "string" &&
    typeof record.channel === "string" &&
    typeof record.notes === "string" &&
    typeof record.isAlumni === "boolean"
  );
}

function isSingleLeadDraft(value: unknown): value is SingleLeadDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.companyId === "string" && isLeadFormValues(record.values)
  );
}

function LeadFormFields({
  lead,
  companies,
  defaultCompanyId,
  defaultChannel = DEFAULT_LEAD_CHANNEL,
  roleOptions,
  onClose,
  onSubmit,
  onCreateCompany,
}: LeadFormFieldsProps) {
  const initialDraft = useMemo<SingleLeadDraft>(
    () => {
      const initialLead = lead ? backfillLeadProfileFields(lead) : null;
      return {
        companyId: lead
          ? String(lead.companyId)
          : defaultCompanyId
            ? String(defaultCompanyId)
            : "",
        values: {
          name: lead?.name ?? "",
          role: lead?.role ?? "",
          email: lead?.email ?? "",
          linkedin: initialLead?.linkedin ?? "",
          xProfile: initialLead?.xProfile ?? "",
          channel: lead?.channel ?? defaultChannel,
          notes: lead?.notes ?? "",
          isAlumni: lead?.isAlumni === true,
        },
      };
    },
    [defaultChannel, defaultCompanyId, lead],
  );
  const validateDraft = useCallback(
    (value: unknown) => isSingleLeadDraft(value),
    [],
  );
  const {
    value: draft,
    setValue: setDraft,
    clearDraft,
    isReady,
    storageError,
  } = useLeadDraftStorage(
    SINGLE_LEAD_DRAFT_KEY,
    initialDraft,
    validateDraft,
    !lead,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.companyId) {
      setCompanyError("Select or create a company");
      return;
    }

    setCompanyError(null);
    setIsSubmitting(true);
    try {
      const currentRoles = await getUniqueLeadRoles();
      const role = canonicalizeLeadRole(draft.values.role, currentRoles);
      await onSubmit({
        companyId: Number(draft.companyId),
        ...draft.values,
        role,
        status: lead?.status ?? DEFAULT_NEW_LEAD_STATUS,
      });
      if (!lead) clearDraft();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isReady ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Restoring saved lead draft...
        </p>
      ) : (
        <>
          {storageError ? (
            <p
              role="alert"
              className="mb-3 text-sm text-amber-700 dark:text-amber-300"
            >
              {storageError}
            </p>
          ) : null}
          <div className="mb-4">
            <FormField label="Company" required>
              <CompanyCombobox
                value={draft.companyId}
                onChange={(nextCompanyId) => {
                  setDraft((current) => ({
                    ...current,
                    companyId: nextCompanyId,
                  }));
                  if (nextCompanyId) setCompanyError(null);
                }}
                companies={companies}
                onCreateCompany={onCreateCompany}
                placeholder="Search or add company..."
              />
              {companyError ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {companyError}
                </p>
              ) : null}
            </FormField>
          </div>
          <LeadFields
            value={draft.values}
            onChange={(values) =>
              setDraft((current) => ({ ...current, values }))
            }
            roleOptions={roleOptions}
          />
          <FormActions
            onCancel={onClose}
            submitLabel={lead ? "Save Changes" : "Add Lead"}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </form>
  );
}

export function LeadFormModal({
  isOpen,
  onClose,
  onSubmit,
  onSubmitBulk,
  lead,
  companies,
  defaultCompanyId,
  defaultChannel,
  onCreateCompany,
}: LeadFormModalProps) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    void getUniqueLeadRoles().then((roles) => {
      if (!cancelled) setRoleOptions(roles);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={lead ? "Edit Lead" : isBulkMode ? "Bulk Add Leads" : "Add Lead"}
      size="lg"
    >
      {!lead ? (
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            aria-pressed={!isBulkMode}
            onClick={() => setIsBulkMode(false)}
            className={`rounded-lg px-3 py-2 text-sm ${
              !isBulkMode
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
            }`}
          >
            Single lead
          </button>
          <button
            type="button"
            aria-pressed={isBulkMode}
            onClick={() => setIsBulkMode(true)}
            className={`rounded-lg px-3 py-2 text-sm ${
              isBulkMode
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
            }`}
          >
            Bulk add
          </button>
        </div>
      ) : null}

      {isBulkMode && !lead ? (
        <BulkLeadForm
          key="bulk"
          companies={companies}
          roleOptions={roleOptions}
          onCreateCompany={onCreateCompany}
          onSubmit={onSubmitBulk}
          onCancel={handleClose}
        />
      ) : (
        <LeadFormFields
          key={
            lead?.id ??
            `create-${defaultCompanyId ?? "none"}-${defaultChannel ?? DEFAULT_LEAD_CHANNEL}`
          }
          lead={lead}
          companies={companies}
          defaultCompanyId={defaultCompanyId}
          defaultChannel={defaultChannel}
          roleOptions={roleOptions}
          onClose={handleClose}
          onSubmit={onSubmit}
          onCreateCompany={onCreateCompany}
        />
      )}
    </Modal>
  );
}
