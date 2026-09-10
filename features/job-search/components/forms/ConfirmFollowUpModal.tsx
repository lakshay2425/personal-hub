"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { formatDate } from "../../lib/dateUtils";
import { getTemplateTitle } from "../../lib/templateUtils";
import type { LeadWithTouchpoints, Template } from "../../types";
import { FormActions, FormField, TextArea } from "./FormFields";

interface ConfirmFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadWithTouchpoints | null;
  which: 1 | 2;
  templateMap: Map<number, Template>;
  onConfirm: (context: string) => Promise<void>;
}

export function ConfirmFollowUpModal({
  isOpen,
  onClose,
  lead,
  which,
  templateMap,
  onConfirm,
}: ConfirmFollowUpModalProps) {
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  const plannedDate =
    which === 1 ? lead.firstFollowUpDate : lead.secondFollowUpDate;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(context);
      setContext("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Follow-up ${which} Sent`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            This will create a follow-up touchpoint for{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {lead.name}
            </span>{" "}
            and clear the planned follow-up {which} date.
          </p>
          {plannedDate ? (
            <p>Planned date: {formatDate(plannedDate)}</p>
          ) : null}
          <p>
            Template:{" "}
            {getTemplateTitle(templateMap, lead.followUpTemplateId)}
          </p>
        </div>
        <FormField label="Context (optional)">
          <TextArea
            value={context}
            onChange={setContext}
            placeholder="Notes about what was sent..."
          />
        </FormField>
        <FormActions
          onCancel={onClose}
          submitLabel={`Mark Follow-up ${which} Sent`}
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
