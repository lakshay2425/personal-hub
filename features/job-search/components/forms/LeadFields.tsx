"use client";

import { LEAD_CHANNELS } from "../../constants";
import type { Lead } from "../../types";
import { CreatableSelectInput } from "./CreatableSelectInput";
import { FormField, SelectInput, TextArea, TextInput } from "./FormFields";

export type LeadFormValues = Pick<
  Lead,
  | "name"
  | "role"
  | "email"
  | "linkedin"
  | "xProfile"
  | "channel"
  | "notes"
  | "isAlumni"
>;

interface LeadFieldsProps {
  value: LeadFormValues;
  onChange: (value: LeadFormValues) => void;
  roleOptions: string[];
  nameError?: string;
  nameRequired?: boolean;
  alumniLabel?: string;
}

export function LeadFields({
  value,
  onChange,
  roleOptions,
  nameError,
  nameRequired = true,
  alumniLabel = "College alumni",
}: LeadFieldsProps) {
  const update = <K extends keyof LeadFormValues>(
    key: K,
    nextValue: LeadFormValues[K],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Name" required={nameRequired}>
        <TextInput
          value={value.name}
          onChange={(next) => update("name", next)}
          placeholder="John Doe"
          required={nameRequired}
        />
        {nameError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {nameError}
          </p>
        ) : null}
      </FormField>
      <FormField label="Role">
        <CreatableSelectInput
          value={value.role}
          onChange={(next) => update("role", next)}
          options={roleOptions}
          placeholder="Select role..."
          createLabel="Add new role..."
          newValuePlaceholder="Enter role title"
        />
      </FormField>
      <FormField label="Email">
        <TextInput
          value={value.email}
          onChange={(next) => update("email", next)}
          placeholder="john@example.com"
          type="email"
        />
      </FormField>
      <FormField label="LinkedIn Profile">
        <TextInput
          value={value.linkedin}
          onChange={(next) => update("linkedin", next)}
          placeholder="https://linkedin.com/in/..."
          type="url"
        />
      </FormField>
      <FormField label="X Profile">
        <TextInput
          value={value.xProfile}
          onChange={(next) => update("xProfile", next)}
          placeholder="https://x.com/username"
          type="url"
        />
      </FormField>
      <FormField label="Channel" required>
        <SelectInput
          value={value.channel}
          onChange={(next) => update("channel", next as Lead["channel"])}
          options={LEAD_CHANNELS.map((channel) => ({
            value: channel,
            label: channel,
          }))}
          required
        />
      </FormField>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.isAlumni}
          onChange={(event) => update("isAlumni", event.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        {alumniLabel}
      </label>
      <div className="sm:col-span-2">
        <FormField label="Notes">
          <TextArea
            value={value.notes}
            onChange={(next) => update("notes", next)}
          />
        </FormField>
      </div>
    </div>
  );
}
