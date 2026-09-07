"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Modal } from "@/components/ui/Modal";

import { FormActions, FormField, TextInput } from "./FormFields";

interface ContactLabelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLabel: string;
  onSubmit: (label: string) => Promise<void>;
}

function ContactLabelFormFields({
  initialLabel,
  onClose,
  onSubmit,
}: Omit<ContactLabelFormModalProps, "isOpen">) {
  const [label, setLabel] = useState(initialLabel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(label);
      onClose();
    } catch {
      toast.error("Failed to update label");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Label">
        <TextInput
          value={label}
          onChange={setLabel}
          placeholder="Optional name to recognize this contact"
        />
      </FormField>
      <FormActions
        onCancel={onClose}
        submitLabel="Save Label"
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function ContactLabelFormModal({
  isOpen,
  onClose,
  initialLabel,
  onSubmit,
}: ContactLabelFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Label" size="md">
      <ContactLabelFormFields
        initialLabel={initialLabel}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
