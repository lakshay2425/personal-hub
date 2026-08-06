"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { LEAD_STATUSES } from "../../constants";
import {
  getUniqueLeadRoles,
  getUniqueLeadTypes,
} from "../../repositories/leadsRepository";
import type { Company, Lead } from "../../types";
import { CreatableSelectInput } from "./CreatableSelectInput";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  lead?: Lead | null;
  companies: Company[];
  defaultCompanyId?: number;
}

interface LeadFormFieldsProps {
  lead?: Lead | null;
  companies: Company[];
  defaultCompanyId?: number;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}

function LeadFormFields({
  lead,
  companies,
  defaultCompanyId,
  onClose,
  onSubmit,
}: LeadFormFieldsProps) {
  const [companyId, setCompanyId] = useState(
    lead
      ? String(lead.companyId)
      : defaultCompanyId
        ? String(defaultCompanyId)
        : "",
  );
  const [name, setName] = useState(lead?.name ?? "");
  const [role, setRole] = useState(lead?.role ?? "");
  const [type, setType] = useState(lead?.type ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [linkedin, setLinkedin] = useState(lead?.linkedin ?? "");
  const [status, setStatus] = useState<Lead["status"]>(lead?.status ?? "New");
  const [firstFollowUpDate, setFirstFollowUpDate] = useState(
    lead?.firstFollowUpDate ?? "",
  );
  const [secondFollowUpDate, setSecondFollowUpDate] = useState(
    lead?.secondFollowUpDate ?? "",
  );
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const [roles, types] = await Promise.all([
        getUniqueLeadRoles(),
        getUniqueLeadTypes(),
      ]);
      if (!cancelled) {
        setRoleOptions(roles);
        setTypeOptions(types);
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        companyId: Number(companyId),
        name,
        role,
        type,
        email,
        linkedin,
        status,
        firstFollowUpDate,
        secondFollowUpDate,
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
          <SelectInput
            value={companyId}
            onChange={setCompanyId}
            placeholder="Select company"
            required
            options={companies.map((c) => ({
              value: c.id!,
              label: c.companyName,
            }))}
          />
        </FormField>
        <FormField label="Name" required>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="John Doe"
            required
          />
        </FormField>
        <FormField label="Role">
          <CreatableSelectInput
            value={role}
            onChange={setRole}
            options={roleOptions}
            placeholder="Select role..."
            createLabel="Add new role..."
            newValuePlaceholder="Enter role title"
          />
        </FormField>
        <FormField label="Type">
          <CreatableSelectInput
            value={type}
            onChange={setType}
            options={typeOptions}
            placeholder="Select type..."
            createLabel="Add new type..."
            newValuePlaceholder="Founder, HR, Recruiter..."
          />
        </FormField>
        <FormField label="Email">
          <TextInput
            value={email}
            onChange={setEmail}
            placeholder="john@example.com"
            type="email"
          />
        </FormField>
        <FormField label="LinkedIn">
          <TextInput
            value={linkedin}
            onChange={setLinkedin}
            placeholder="https://linkedin.com/in/..."
            type="url"
          />
        </FormField>
        <FormField label="Status">
          <SelectInput
            value={status}
            onChange={(v) => setStatus(v as Lead["status"])}
            options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </FormField>
        <FormField label="First Follow-up">
          <TextInput
            value={firstFollowUpDate}
            onChange={setFirstFollowUpDate}
            type="date"
          />
        </FormField>
        <FormField label="Second Follow-up">
          <TextInput
            value={secondFollowUpDate}
            onChange={setSecondFollowUpDate}
            type="date"
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
        submitLabel={lead ? "Save Changes" : "Add Lead"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function LeadFormModal({
  isOpen,
  onClose,
  onSubmit,
  lead,
  companies,
  defaultCompanyId,
}: LeadFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? "Edit Lead" : "Add Lead"}
      size="lg"
    >
      <LeadFormFields
        key={lead?.id ?? `create-${defaultCompanyId ?? "none"}`}
        lead={lead}
        companies={companies}
        defaultCompanyId={defaultCompanyId}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
