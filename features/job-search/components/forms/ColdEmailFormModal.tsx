"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { COLD_EMAIL_STATUSES } from "../../constants";
import { buildTemplateMap } from "../../lib/templateUtils";
import type { ColdEmail, Company, Lead, Template } from "../../types";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";
import { TemplateSelectInput } from "./TemplateSelectInput";

interface ColdEmailFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ColdEmail, "id" | "createdAt">) => Promise<void>;
  coldEmail?: ColdEmail | null;
  companies: Company[];
  leads: Lead[];
  templates: Template[];
  defaultCompanyId?: number;
}

interface ColdEmailFormFieldsProps {
  coldEmail?: ColdEmail | null;
  companies: Company[];
  leads: Lead[];
  templates: Template[];
  defaultCompanyId?: number;
  onClose: () => void;
  onSubmit: (data: Omit<ColdEmail, "id" | "createdAt">) => Promise<void>;
}

function ColdEmailFormFields({
  coldEmail,
  companies,
  leads,
  templates,
  defaultCompanyId,
  onClose,
  onSubmit,
}: ColdEmailFormFieldsProps) {
  const [companyId, setCompanyId] = useState(
    coldEmail
      ? String(coldEmail.companyId)
      : defaultCompanyId
        ? String(defaultCompanyId)
        : "",
  );
  const [leadId, setLeadId] = useState(
    coldEmail ? String(coldEmail.leadId) : "",
  );
  const [role, setRole] = useState(coldEmail?.role ?? "");
  const [sentDate, setSentDate] = useState(coldEmail?.sentDate ?? "");
  const [status, setStatus] = useState<ColdEmail["status"]>(
    coldEmail?.status ?? "Draft",
  );
  const [firstFollowUpDate, setFirstFollowUpDate] = useState(
    coldEmail?.firstFollowUpDate ?? "",
  );
  const [secondFollowUpDate, setSecondFollowUpDate] = useState(
    coldEmail?.secondFollowUpDate ?? "",
  );
  const [templateId, setTemplateId] = useState(
    coldEmail?.templateId != null ? String(coldEmail.templateId) : "",
  );
  const [followUpTemplateId, setFollowUpTemplateId] = useState(
    coldEmail?.followUpTemplateId != null
      ? String(coldEmail.followUpTemplateId)
      : "",
  );
  const [notes, setNotes] = useState(coldEmail?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateMap = useMemo(
    () => buildTemplateMap(templates),
    [templates],
  );

  const filteredLeads = useMemo(
    () =>
      companyId
        ? leads.filter((l) => l.companyId === Number(companyId))
        : [],
    [leads, companyId],
  );

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setLeadId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedTemplate = templateId
        ? templateMap.get(Number(templateId))
        : undefined;

      await onSubmit({
        companyId: Number(companyId),
        leadId: Number(leadId),
        role,
        sentDate,
        status,
        firstFollowUpDate,
        secondFollowUpDate,
        templateId: templateId ? Number(templateId) : null,
        followUpTemplateId: followUpTemplateId
          ? Number(followUpTemplateId)
          : null,
        templateName: selectedTemplate?.title ?? coldEmail?.templateName ?? "",
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
            onChange={handleCompanyChange}
            placeholder="Select company"
            required
            options={companies.map((c) => ({
              value: c.id!,
              label: c.companyName,
            }))}
          />
        </FormField>
        <FormField label="Lead" required>
          <SelectInput
            value={leadId}
            onChange={setLeadId}
            placeholder={
              companyId ? "Select lead" : "Select company first"
            }
            required
            options={filteredLeads.map((l) => ({
              value: l.id!,
              label: l.name,
            }))}
          />
        </FormField>
        <FormField label="Role">
          <TextInput
            value={role}
            onChange={setRole}
            placeholder="Role you're targeting"
          />
        </FormField>
        <FormField label="Sent Date">
          <TextInput
            value={sentDate}
            onChange={setSentDate}
            type="date"
          />
        </FormField>
        <FormField label="Status">
          <SelectInput
            value={status}
            onChange={(v) => setStatus(v as ColdEmail["status"])}
            options={COLD_EMAIL_STATUSES.map((s) => ({
              value: s,
              label: s,
            }))}
          />
        </FormField>
        <TemplateSelectInput
          label="Outreach Template"
          value={templateId}
          onChange={setTemplateId}
          templates={templates}
          filterType="Cold Email"
          placeholder="Select cold email template (optional)"
        />
        <TemplateSelectInput
          label="Follow-up Template"
          value={followUpTemplateId}
          onChange={setFollowUpTemplateId}
          templates={templates}
          filterType="Follow-up"
          placeholder="Select follow-up template (optional)"
        />
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
        submitLabel={coldEmail ? "Save Changes" : "Add Cold Email"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function ColdEmailFormModal({
  isOpen,
  onClose,
  onSubmit,
  coldEmail,
  companies,
  leads,
  templates,
  defaultCompanyId,
}: ColdEmailFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coldEmail ? "Edit Cold Email" : "Add Cold Email"}
      size="lg"
    >
      <ColdEmailFormFields
        key={coldEmail?.id ?? `create-${defaultCompanyId ?? "none"}`}
        coldEmail={coldEmail}
        companies={companies}
        leads={leads}
        templates={templates}
        defaultCompanyId={defaultCompanyId}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
