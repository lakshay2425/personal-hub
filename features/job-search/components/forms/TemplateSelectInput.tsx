"use client";

import type { Template, TemplateType } from "../../types";
import { filterTemplatesByType } from "../../lib/templateUtils";
import { FormField, SelectInput } from "./FormFields";

interface TemplateSelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  templates: Template[];
  filterType: TemplateType;
  placeholder?: string;
}

export function TemplateSelectInput({
  label,
  value,
  onChange,
  templates,
  filterType,
  placeholder = "Select template (optional)",
}: TemplateSelectInputProps) {
  const options = filterTemplatesByType(templates, filterType);

  return (
    <FormField label={label}>
      <SelectInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        options={options.map((template) => ({
          value: template.id!,
          label: template.title,
        }))}
      />
    </FormField>
  );
}
