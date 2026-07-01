"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/features/questions/components/ConfirmDialog";
import { QuestionFormModal } from "@/features/questions/components/QuestionFormModal";
import { QuestionList } from "@/features/questions/components/QuestionList";
import { useQuestions } from "@/features/questions/hooks/useQuestions";
import type { QuestionFormValues } from "@/features/questions/schema";
import type { Question } from "@/features/questions/types";

export default function QuestionsPage() {
  const {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    toggleStatus,
    deleteQuestion,
  } = useQuestions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
  };

  const handleFormSubmit = useCallback(
    async (values: QuestionFormValues) => {
      try {
        if (editingQuestion) {
          await updateQuestion(editingQuestion.id, values.questionText);
          toast.success("Question updated");
        } else {
          await createQuestion(values.questionText);
          toast.success("Question created");
        }
        handleCloseForm();
      } catch {
        toast.error(
          editingQuestion
            ? "Failed to update question"
            : "Failed to create question",
        );
      }
    },
    [createQuestion, editingQuestion, updateQuestion],
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      setTogglingId(id);
      try {
        await toggleStatus(id);
      } catch {
        toast.error("Failed to update status");
      } finally {
        setTogglingId(null);
      }
    },
    [toggleStatus],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingQuestion) return;

    setIsDeleting(true);
    try {
      await deleteQuestion(deletingQuestion.id);
      toast.success("Question deleted");
      setDeletingQuestion(null);
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteQuestion, deletingQuestion]);

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="mb-2 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
          >
            &larr; Home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Questions
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Stored locally in your browser via IndexedDB
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Question
        </button>
      </div>

      <QuestionList
        questions={questions}
        isLoading={isLoading}
        error={error}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEdit}
        onDelete={setDeletingQuestion}
        togglingId={togglingId}
      />

      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        question={editingQuestion}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
