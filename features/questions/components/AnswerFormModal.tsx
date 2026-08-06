"use client";

import type { Answer } from "../types";
import type { AnswerFormValues } from "../schema";
import { Modal } from "./Modal";
import { AnswerForm } from "./AnswerForm";

interface AnswerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AnswerFormValues) => Promise<void>;
  answer?: Answer | null;
}

export function AnswerFormModal({
  isOpen,
  onClose,
  onSubmit,
  answer,
}: AnswerFormModalProps) {
  const isEdit = Boolean(answer);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit answer" : "New answer"}
      size="lg"
    >
      <AnswerForm
        key={answer?.id ?? "create"}
        defaultValues={
          answer ? { title: answer.title, body: answer.body } : undefined
        }
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? "Update" : "Create"}
      />
    </Modal>
  );
}
