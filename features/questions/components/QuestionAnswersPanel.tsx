"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { DuplicateAnswerTitleError } from "../lib/answersRepository";
import { useAnswers } from "../hooks/useAnswers";
import type { Answer, Question } from "../types";
import type { AnswerFormValues } from "../schema";
import { AnswerFormModal } from "./AnswerFormModal";
import { AnswerList } from "./AnswerList";
import { ConfirmDialog } from "./ConfirmDialog";

interface QuestionAnswersPanelProps {
  question: Question;
  projectId: string | null;
  onAnswerCountChange?: (questionId: string, count: number) => void;
}

export function QuestionAnswersPanel({
  question,
  projectId,
  onAnswerCountChange,
}: QuestionAnswersPanelProps) {
  const { answers, isLoading, error, createAnswer, updateAnswer, deleteAnswer } =
    useAnswers(question.id);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [deletingAnswer, setDeletingAnswer] = useState<Answer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const syncCount = useCallback(
    (nextCount: number) => {
      onAnswerCountChange?.(question.id, nextCount);
    },
    [onAnswerCountChange, question.id],
  );

  const handleOpenCreate = () => {
    setEditingAnswer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (answer: Answer) => {
    setEditingAnswer(answer);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAnswer(null);
  };

  const handleSubmit = async (values: AnswerFormValues) => {
    try {
      if (editingAnswer) {
        await updateAnswer(editingAnswer.id, values);
        toast.success("Answer updated");
      } else {
        await createAnswer({
          projectId,
          title: values.title,
          body: values.body,
        });
        toast.success("Answer created");
        syncCount(answers.length + 1);
      }
      handleCloseForm();
    } catch (err) {
      if (err instanceof DuplicateAnswerTitleError) {
        toast.error(err.message);
        return;
      }
      toast.error(editingAnswer ? "Failed to update answer" : "Failed to create answer");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAnswer) return;

    setIsDeleting(true);
    try {
      await deleteAnswer(deletingAnswer.id);
      toast.success("Answer deleted");
      syncCount(Math.max(0, answers.length - 1));
      setDeletingAnswer(null);
    } catch {
      toast.error("Failed to delete answer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Answers ({answers.length})
        </p>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add answer
        </button>
      </div>

      <AnswerList
        answers={answers}
        isLoading={isLoading}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={setDeletingAnswer}
      />

      <AnswerFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        answer={editingAnswer}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingAnswer)}
        onClose={() => setDeletingAnswer(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete answer?"
        message="This answer will be permanently removed."
      />
    </div>
  );
}
