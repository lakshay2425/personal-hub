"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAnswerCountsByQuestionIds } from "../lib/answersRepository";
import { useQuestions } from "../hooks/useQuestions";
import type { QuestionFormValues } from "../schema";
import type { Question } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { QuestionFormModal } from "./QuestionFormModal";
import { QuestionList } from "./QuestionList";

interface QuestionsWorkspaceProps {
  projectId?: string | null;
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function QuestionsWorkspace({
  projectId = null,
  title,
  description,
  backHref,
  backLabel = "Home",
  emptyTitle,
  emptyDescription,
}: QuestionsWorkspaceProps) {
  const {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    toggleStatus,
    deleteQuestion,
  } = useQuestions({ projectId });

  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      if (questions.length === 0) {
        if (!cancelled) {
          setAnswerCounts({});
        }
        return;
      }

      const counts = await getAnswerCountsByQuestionIds(
        questions.map((question) => question.id),
      );
      if (!cancelled) {
        setAnswerCounts(counts);
      }
    }

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, [questions]);

  const handleAnswerCountChange = useCallback(
    (questionId: string, count: number) => {
      setAnswerCounts((prev) => ({ ...prev, [questionId]: count }));
    },
    [],
  );

  const handleToggleExpand = useCallback((questionId: string) => {
    setExpandedQuestionId((current) =>
      current === questionId ? null : questionId,
    );
  }, []);

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
      if (expandedQuestionId === deletingQuestion.id) {
        setExpandedQuestionId(null);
      }
      setAnswerCounts((prev) => {
        const next = { ...prev };
        delete next[deletingQuestion.id];
        return next;
      });
      toast.success("Question deleted");
      setDeletingQuestion(null);
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteQuestion, deletingQuestion, expandedQuestionId]);

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="mb-2 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
          >
            &larr; {backLabel}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-full shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Question
        </button>
      </div>

      <QuestionList
        questions={questions}
        isLoading={isLoading}
        error={error}
        answerCounts={answerCounts}
        expandedQuestionId={expandedQuestionId}
        projectId={projectId}
        onToggleExpand={handleToggleExpand}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEdit}
        onDelete={setDeletingQuestion}
        onAnswerCountChange={handleAnswerCountChange}
        togglingId={togglingId}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
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
        title="Delete question?"
        message="This question and all of its answers will be permanently removed."
      />
    </div>
  );
}
