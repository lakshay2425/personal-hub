"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { TEMPLATE_TYPES } from "../../constants";
import type { Template, TemplateType } from "../../types";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Template, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  template?: Template | null;
  defaultType?: TemplateType;
}

interface TemplateFormFieldsProps {
  template?: Template | null;
  defaultType?: TemplateType;
  onClose: () => void;
  onSubmit: (
    data: Omit<Template, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}

function TemplateFormFields({
  template,
  defaultType,
  onClose,
  onSubmit,
}: TemplateFormFieldsProps) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [type, setType] = useState<TemplateType>(
    template?.type ?? defaultType ?? "Cold Email",
  );
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [notes, setNotes] = useState(template?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        subject: type === "Cold Email" ? subject.trim() : "",
        body: body.trim(),
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <FormField label="Title" required>
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Intro to Startup HR"
            required
            voice={false}
          />
        </FormField>

        <FormField label="Type" required>
          <SelectInput
            value={type}
            onChange={(value) => setType(value as TemplateType)}
            options={TEMPLATE_TYPES.map((templateType) => ({
              value: templateType,
              label: templateType,
            }))}
            required
          />
        </FormField>

        {type === "Cold Email" && (
          <FormField label="Subject">
            <TextInput
              value={subject}
              onChange={setSubject}
              placeholder="Quick intro — {{role}} at {{company}}"
              voice={false}
            />
          </FormField>
        )}

        <FormField label="Body" required>
          <TextArea
            value={body}
            onChange={setBody}
            placeholder="Hi {{name}}, I noticed {{company}} is hiring for {{role}}..."
            rows={8}
          />
        </FormField>

        <FormField label="Notes">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Use for warm intros to HR leads..."
            rows={3}
          />
        </FormField>
      </div>

      <FormActions
        onCancel={onClose}
        submitLabel={template ? "Save Changes" : "Add Template"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function TemplateFormModal({
  isOpen,
  onClose,
  onSubmit,
  template,
  defaultType,
}: TemplateFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? "Edit Template" : "Add Template"}
      size="lg"
    >
      <TemplateFormFields
        key={template?.id ?? `create-${defaultType ?? "Cold Email"}`}
        template={template}
        defaultType={defaultType}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
