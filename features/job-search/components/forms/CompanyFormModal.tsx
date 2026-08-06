"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  FormActions,
  FormField,
  TextArea,
  TextInput,
} from "./FormFields";
import type { Company } from "../../types";

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  company?: Company | null;
}

interface CompanyFormFieldsProps {
  company?: Company | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}

function CompanyFormFields({
  company,
  onClose,
  onSubmit,
}: CompanyFormFieldsProps) {
  const [companyName, setCompanyName] = useState(company?.companyName ?? "");
  const [sector, setSector] = useState(company?.sector ?? "");
  const [website, setWebsite] = useState(company?.website ?? "");
  const [notes, setNotes] = useState(company?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ companyName, sector, website, notes });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField label="Company Name" required>
          <TextInput
            value={companyName}
            onChange={setCompanyName}
            placeholder="Acme Inc."
            required
          />
        </FormField>
        <FormField label="Sector">
          <TextInput
            value={sector}
            onChange={setSector}
            placeholder="Technology, Finance..."
          />
        </FormField>
        <FormField label="Website">
          <TextInput
            value={website}
            onChange={setWebsite}
            placeholder="https://example.com"
            type="url"
          />
        </FormField>
        <FormField label="Notes">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Additional notes..."
          />
        </FormField>
      </div>
      <FormActions
        onCancel={onClose}
        submitLabel={company ? "Save Changes" : "Add Company"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function CompanyFormModal({
  isOpen,
  onClose,
  onSubmit,
  company,
}: CompanyFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? "Edit Company" : "Add Company"}
    >
      <CompanyFormFields
        key={company?.id ?? "create"}
        company={company}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
