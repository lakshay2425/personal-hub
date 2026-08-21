"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { APPLICATION_STATUSES } from "../../constants";
import type { Application, Company } from "../../types";
import { CompanyCombobox } from "./CompanyCombobox";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Application, "id" | "createdAt">) => Promise<void>;
  application?: Application | null;
  companies: Company[];
  defaultCompanyId?: number;
  onCreateCompany: (companyName: string) => Promise<Company>;
}

interface ApplicationFormFieldsProps {
  application?: Application | null;
  companies: Company[];
  defaultCompanyId?: number;
  onClose: () => void;
  onSubmit: (data: Omit<Application, "id" | "createdAt">) => Promise<void>;
  onCreateCompany: (companyName: string) => Promise<Company>;
}

function ApplicationFormFields({
  application,
  companies,
  defaultCompanyId,
  onClose,
  onSubmit,
  onCreateCompany,
}: ApplicationFormFieldsProps) {
  const [companyId, setCompanyId] = useState(
    application
      ? String(application.companyId)
      : defaultCompanyId
        ? String(defaultCompanyId)
        : "",
  );
  const [role, setRole] = useState(application?.role ?? "");
  const [portal, setPortal] = useState(application?.portal ?? "");
  const [jobLink, setJobLink] = useState(application?.jobLink ?? "");
  const [appliedDate, setAppliedDate] = useState(application?.appliedDate ?? "");
  const [status, setStatus] = useState<Application["status"]>(
    application?.status ?? "Applied",
  );
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setCompanyError("Select or create a company");
      return;
    }

    setCompanyError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        companyId: Number(companyId),
        role,
        portal,
        jobLink,
        appliedDate,
        status,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company" required>
          <CompanyCombobox
            value={companyId}
            onChange={(nextCompanyId) => {
              setCompanyId(nextCompanyId);
              if (nextCompanyId) {
                setCompanyError(null);
              }
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
        <FormField label="Role" required>
          <TextInput
            value={role}
            onChange={setRole}
            placeholder="Software Engineer"
            required
          />
        </FormField>
        <FormField label="Portal">
          <TextInput
            value={portal}
            onChange={setPortal}
            placeholder="LinkedIn, Naukri, Company Site..."
          />
        </FormField>
        <FormField label="Applied Date">
          <TextInput
            value={appliedDate}
            onChange={setAppliedDate}
            type="date"
          />
        </FormField>
        <FormField label="Status">
          <SelectInput
            value={status}
            onChange={(v) => setStatus(v as Application["status"])}
            options={APPLICATION_STATUSES.map((s) => ({
              value: s,
              label: s,
            }))}
          />
        </FormField>
        <FormField label="Job Link">
          <TextInput
            value={jobLink}
            onChange={setJobLink}
            placeholder="https://..."
            type="url"
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Notes">
            <TextArea value={notes} onChange={setNotes} />
          </FormField>
        </div>
      </div>
      <FormActions
        onCancel={onClose}
        submitLabel={application ? "Save Changes" : "Add Application"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function ApplicationFormModal({
  isOpen,
  onClose,
  onSubmit,
  application,
  companies,
  defaultCompanyId,
  onCreateCompany,
}: ApplicationFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application ? "Edit Application" : "Add Application"}
      size="lg"
    >
      <ApplicationFormFields
        key={application?.id ?? `create-${defaultCompanyId ?? "none"}`}
        application={application}
        companies={companies}
        defaultCompanyId={defaultCompanyId}
        onClose={onClose}
        onSubmit={onSubmit}
        onCreateCompany={onCreateCompany}
      />
    </Modal>
  );
}
