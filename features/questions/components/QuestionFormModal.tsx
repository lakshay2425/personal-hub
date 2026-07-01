"use client";

import type { Question } from "../types";
import type { QuestionFormValues } from "../schema";
import { Modal } from "./Modal";
import { QuestionForm } from "./QuestionForm";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  question?: Question | null;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  question,
}: QuestionFormModalProps) {
  const isEdit = Boolean(question);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit question" : "New question"}
    >
      <QuestionForm
        key={question?.id ?? "create"}
        defaultValues={
          question ? { questionText: question.questionText } : undefined
        }
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? "Update" : "Create"}
      />
    </Modal>
  );
}
