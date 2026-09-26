"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  DEFAULT_RESPONSE_STATUS,
  DEFAULT_TOUCHPOINT_STATUS,
  DEFAULT_TOUCHPOINT_TYPES,
  ACCEPTANCE_RESPONSE_STATUSES,
  EMAIL_RESPONSE_STATUSES,
  EMAIL_TOUCHPOINT_TYPES,
  LEAD_CHANNELS,
  LINKEDIN_RESPONSE_STATUSES,
  LINKEDIN_TOUCHPOINT_TYPES,
} from "../../constants";
import { getOutreachTemplateTypeForChannel } from "../../lib/templateUtils";
import type { LeadTouchpoint, Template } from "../../types";
import { CreatableSelectInput } from "./CreatableSelectInput";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";
import { TemplateSelectInput } from "./TemplateSelectInput";
import type { LeadTouchpointInput } from "../../repositories/leadTouchpointsRepository";

export type LeadTouchpointFormMode = "addTouchpoint" | "editTouchpoint";

interface LeadTouchpointFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: LeadTouchpointFormMode;
  touchpoint?: LeadTouchpoint | null;
  defaultChannel?: LeadTouchpoint["channel"];
  templates: Template[];
  touchpointStatusOptions: string[];
  responseStatusOptions: string[];
  touchpointTypeOptions: string[];
  onSubmit: (data: LeadTouchpointInput) => Promise<void>;
}

interface LeadTouchpointFormFieldsProps {
  mode: LeadTouchpointFormMode;
  touchpoint?: LeadTouchpoint | null;
  defaultChannel: LeadTouchpoint["channel"];
  templates: Template[];
  touchpointStatusOptions: string[];
  responseStatusOptions: string[];
  touchpointTypeOptions: string[];
  onClose: () => void;
  onSubmit: (data: LeadTouchpointInput) => Promise<void>;
}

function toDateInputValue(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateInputToTimestamp(value: string): number {
  if (!value.trim()) return Date.now();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
}

function LeadTouchpointFormFields({
  mode,
  touchpoint,
  defaultChannel,
  templates,
  touchpointStatusOptions,
  responseStatusOptions,
  touchpointTypeOptions,
  onClose,
  onSubmit,
}: LeadTouchpointFormFieldsProps) {
  const [channel, setChannel] = useState<LeadTouchpoint["channel"]>(
    touchpoint?.channel ?? defaultChannel,
  );
  const [type, setType] = useState(touchpoint?.type ?? "");
  const [status, setStatus] = useState(
    touchpoint?.status ?? DEFAULT_TOUCHPOINT_STATUS,
  );
  const [responseStatus, setResponseStatus] = useState(
    touchpoint?.channel === "Email" &&
      ACCEPTANCE_RESPONSE_STATUSES.includes(touchpoint.responseStatus)
      ? DEFAULT_RESPONSE_STATUS
      : touchpoint?.responseStatus ?? DEFAULT_RESPONSE_STATUS,
  );
  const [templateId, setTemplateId] = useState(
    touchpoint?.templateId != null ? String(touchpoint.templateId) : "",
  );
  const [context, setContext] = useState(touchpoint?.context ?? "");
  const [occurredAt, setOccurredAt] = useState(
    toDateInputValue(touchpoint?.occurredAt),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outreachTemplateType = getOutreachTemplateTypeForChannel(channel);
  const templateFilterType =
    channel === "Email" ? "Cold Email" : outreachTemplateType;
  const builtInTypes = [...LINKEDIN_TOUCHPOINT_TYPES, ...EMAIL_TOUCHPOINT_TYPES, ...DEFAULT_TOUCHPOINT_TYPES];
  const customTypes = touchpointTypeOptions.filter((option) => !builtInTypes.includes(option));
  const availableTypes = channel === "Email"
    ? [...EMAIL_TOUCHPOINT_TYPES, ...customTypes]
    : channel === "LinkedIn"
      ? [...LINKEDIN_TOUCHPOINT_TYPES, ...customTypes]
      : touchpointTypeOptions;
  const builtInResponses = [...LINKEDIN_RESPONSE_STATUSES, "Positive Response"];
  const customResponses = responseStatusOptions.filter((option) => !builtInResponses.includes(option));
  const availableResponses = channel === "Email"
    ? [...EMAIL_RESPONSE_STATUSES, ...customResponses]
    : channel === "LinkedIn"
      ? [...LINKEDIN_RESPONSE_STATUSES, ...customResponses]
      : responseStatusOptions;

  const changeChannel = (nextChannel: LeadTouchpoint["channel"]) => {
    setChannel(nextChannel);
    const nextTypes = nextChannel === "Email"
      ? [...EMAIL_TOUCHPOINT_TYPES, ...customTypes]
      : nextChannel === "LinkedIn"
        ? [...LINKEDIN_TOUCHPOINT_TYPES, ...customTypes]
        : touchpointTypeOptions;
    if (type && !nextTypes.includes(type)) setType("");
    const nextResponses = nextChannel === "Email"
      ? [...EMAIL_RESPONSE_STATUSES, ...customResponses]
      : nextChannel === "LinkedIn"
        ? [...LINKEDIN_RESPONSE_STATUSES, ...customResponses]
        : responseStatusOptions;
    if (!nextResponses.includes(responseStatus)) setResponseStatus(DEFAULT_RESPONSE_STATUS);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        channel,
        type: type.trim() || "Other",
        status: status.trim() || DEFAULT_TOUCHPOINT_STATUS,
        responseStatus: responseStatus.trim() || DEFAULT_RESPONSE_STATUS,
        templateId: templateId ? Number(templateId) : null,
        context,
        occurredAt: dateInputToTimestamp(occurredAt),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Channel" required>
          <SelectInput
            value={channel}
            onChange={(value) => changeChannel(value as LeadTouchpoint["channel"])}
            options={LEAD_CHANNELS.map((option) => ({
              value: option,
              label: option,
            }))}
            required
          />
        </FormField>
        <FormField label="Type" required>
          <CreatableSelectInput
            value={type}
            onChange={setType}
            options={availableTypes}
            placeholder="Select type..."
            createLabel="Add new type..."
            newValuePlaceholder="Initial, Follow-up..."
          />
        </FormField>
        <FormField label="Status" required>
          <CreatableSelectInput
            value={status}
            onChange={setStatus}
            options={touchpointStatusOptions}
            placeholder="Select status..."
            createLabel="Add new status..."
            newValuePlaceholder="Draft, Sent..."
          />
        </FormField>
        <FormField label="Response" required>
          <CreatableSelectInput
            value={responseStatus}
            onChange={setResponseStatus}
            options={availableResponses}
            placeholder="Select response..."
            createLabel="Add new response..."
            newValuePlaceholder="Not responded, Replied..."
          />
        </FormField>
        <FormField label="Date">
          <TextInput
            value={occurredAt}
            onChange={setOccurredAt}
            type="date"
          />
        </FormField>
        {templateFilterType ? (
          <TemplateSelectInput
            label="Template"
            value={templateId}
            onChange={setTemplateId}
            templates={templates}
            filterType={templateFilterType}
            placeholder="Select template (optional)"
          />
        ) : (
          <FormField label="Template">
            <SelectInput
              value={templateId}
              onChange={setTemplateId}
              placeholder="No template filter for this channel"
              options={templates.map((template) => ({
                value: template.id!,
                label: template.title,
              }))}
            />
          </FormField>
        )}
        <div className="sm:col-span-2">
          <FormField label="Context">
            <TextArea value={context} onChange={setContext} />
          </FormField>
        </div>
      </div>
      <FormActions
        onCancel={onClose}
        submitLabel={
          mode === "editTouchpoint" ? "Save Changes" : "Add Touchpoint"
        }
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function LeadTouchpointFormModal({
  isOpen,
  onClose,
  mode,
  touchpoint,
  defaultChannel = "Email",
  templates,
  touchpointStatusOptions,
  responseStatusOptions,
  touchpointTypeOptions,
  onSubmit,
}: LeadTouchpointFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "editTouchpoint" ? "Edit Touchpoint" : "Add Touchpoint"}
      size="lg"
    >
      <LeadTouchpointFormFields
        key={`${mode}-${touchpoint?.id ?? "new"}-${defaultChannel}`}
        mode={mode}
        touchpoint={touchpoint}
        defaultChannel={defaultChannel}
        templates={templates}
        touchpointStatusOptions={touchpointStatusOptions}
        responseStatusOptions={responseStatusOptions}
        touchpointTypeOptions={touchpointTypeOptions}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
