"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  DEFAULT_LEAD_CHANNEL,
  LEAD_CHANNELS,
  LEAD_STATUSES,
} from "../../constants";
import { getLeadProfileLabel } from "../../lib/leadProfileUtils";
import { getOutreachTemplateTypeForChannel } from "../../lib/templateUtils";
import {
  getUniqueLeadRoles,
  getUniqueLeadTypes,
} from "../../repositories/leadsRepository";
import type { Company, Lead, Template } from "../../types";
import { CompanyCombobox } from "./CompanyCombobox";
import { CreatableSelectInput } from "./CreatableSelectInput";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";
import { TemplateSelectInput } from "./TemplateSelectInput";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  lead?: Lead | null;
  companies: Company[];
  templates: Template[];
  defaultCompanyId?: number;
  defaultChannel?: Lead["channel"];
  channelOptions?: Lead["channel"][];
  onCreateCompany: (companyName: string) => Promise<Company>;
}

interface LeadFormFieldsProps {
  lead?: Lead | null;
  companies: Company[];
  templates: Template[];
  defaultCompanyId?: number;
  defaultChannel?: Lead["channel"];
  channelOptions?: Lead["channel"][];
  onClose: () => void;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  onCreateCompany: (companyName: string) => Promise<Company>;
}

function LeadFormFields({
  lead,
  companies,
  templates,
  defaultCompanyId,
  defaultChannel = DEFAULT_LEAD_CHANNEL,
  channelOptions = LEAD_CHANNELS,
  onClose,
  onSubmit,
  onCreateCompany,
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
  const [channel, setChannel] = useState<Lead["channel"]>(
    lead?.channel ?? defaultChannel,
  );
  const [status, setStatus] = useState<Lead["status"]>(lead?.status ?? "New");
  const [firstFollowUpDate, setFirstFollowUpDate] = useState(
    lead?.firstFollowUpDate ?? "",
  );
  const [secondFollowUpDate, setSecondFollowUpDate] = useState(
    lead?.secondFollowUpDate ?? "",
  );
  const [templateId, setTemplateId] = useState(
    lead?.templateId != null ? String(lead.templateId) : "",
  );
  const [followUpTemplateId, setFollowUpTemplateId] = useState(
    lead?.followUpTemplateId != null ? String(lead.followUpTemplateId) : "",
  );
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

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

  const outreachTemplateType = getOutreachTemplateTypeForChannel(channel);
  const showOutreachTemplate = outreachTemplateType !== null;
  const showFollowUpTemplate =
    channel === "Email" || outreachTemplateType !== null;

  const handleChannelChange = (value: Lead["channel"]) => {
    setChannel(value);
    const nextOutreachType = getOutreachTemplateTypeForChannel(value);
    if (
      templateId &&
      nextOutreachType &&
      !templates.some(
        (template) =>
          template.id === Number(templateId) &&
          template.type === nextOutreachType,
      )
    ) {
      setTemplateId("");
    }
    if (nextOutreachType === null) {
      setTemplateId("");
    }
    if (value !== "Email" && nextOutreachType === null) {
      setFollowUpTemplateId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setCompanyError("Select or create a company");
      return;
    }

    setCompanyError(null);
    setIsSubmitting(true);
    const isEmailChannel = channel === "Email";
    try {
      await onSubmit({
        companyId: Number(companyId),
        name,
        role,
        type,
        email,
        linkedin,
        channel,
        status,
        firstFollowUpDate: isEmailChannel ? firstFollowUpDate || null : null,
        secondFollowUpDate: isEmailChannel ? secondFollowUpDate || null : null,
        templateId: showOutreachTemplate && templateId ? Number(templateId) : null,
        followUpTemplateId: showFollowUpTemplate && followUpTemplateId
          ? Number(followUpTemplateId)
          : null,
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
        <FormField label={getLeadProfileLabel(channel)}>
          <TextInput
            value={linkedin}
            onChange={setLinkedin}
            placeholder={
              channel === "X"
                ? "https://x.com/username"
                : "https://linkedin.com/in/..."
            }
            type="url"
          />
        </FormField>
        <FormField label="Channel" required>
          <SelectInput
            value={channel}
            onChange={(v) => handleChannelChange(v as Lead["channel"])}
            options={channelOptions.map((c) => ({ value: c, label: c }))}
            required
          />
        </FormField>
        <FormField label="Status">
          <SelectInput
            value={status}
            onChange={(v) => setStatus(v as Lead["status"])}
            options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </FormField>
        {showOutreachTemplate && outreachTemplateType ? (
          <TemplateSelectInput
            label="Outreach Template"
            value={templateId}
            onChange={setTemplateId}
            templates={templates}
            filterType={outreachTemplateType}
            placeholder={`Select ${outreachTemplateType.toLowerCase()} template (optional)`}
          />
        ) : null}
        {showFollowUpTemplate ? (
          <TemplateSelectInput
            label="Follow-up Template"
            value={followUpTemplateId}
            onChange={setFollowUpTemplateId}
            templates={templates}
            filterType="Follow-up"
            placeholder="Select follow-up template (optional)"
          />
        ) : null}
        {channel === "Email" ? (
          <>
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
          </>
        ) : null}
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
  templates,
  defaultCompanyId,
  defaultChannel,
  channelOptions,
  onCreateCompany,
}: LeadFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? "Edit Lead" : "Add Lead"}
      size="lg"
    >
      <LeadFormFields
        key={
          lead?.id ??
          `create-${defaultCompanyId ?? "none"}-${defaultChannel ?? DEFAULT_LEAD_CHANNEL}`
        }
        lead={lead}
        companies={companies}
        templates={templates}
        defaultCompanyId={defaultCompanyId}
        defaultChannel={defaultChannel}
        channelOptions={channelOptions}
        onClose={onClose}
        onSubmit={onSubmit}
        onCreateCompany={onCreateCompany}
      />
    </Modal>
  );
}
