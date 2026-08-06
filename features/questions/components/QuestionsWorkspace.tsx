"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAnswerCountsByQuestionIds } from "../lib/answersRepository";
import { countDescendantsInList } from "../lib/questionTree";
import { useQuestions } from "../hooks/useQuestions";
import type { QuestionFormValues } from "../schema";
import type { Question, QuestionTreeNode } from "../types";
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
    moveToParent,
  } = useQuestions({ projectId });

  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [subQuestionParent, setSubQuestionParent] =
    useState<QuestionTreeNode | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionTreeNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingUnderId, setMovingUnderId] = useState<string | null>(null);

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

  const handleToggleChildrenCollapse = useCallback((questionId: string) => {
    setCollapsedQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setSubQuestionParent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (question: QuestionTreeNode) => {
    setEditingQuestion(question);
    setSubQuestionParent(null);
    setIsFormOpen(true);
  };

  const handleAddSubQuestion = (parent: QuestionTreeNode) => {
    setEditingQuestion(null);
    setSubQuestionParent(parent);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
    setSubQuestionParent(null);
  };

  const handleFormSubmit = useCallback(
    async (values: QuestionFormValues) => {
      try {
        if (editingQuestion) {
          await updateQuestion(editingQuestion.id, values.questionText);
          toast.success("Question updated");
        } else if (subQuestionParent) {
          await createQuestion(values.questionText, subQuestionParent.id);
          setCollapsedQuestionIds((current) => {
            const next = new Set(current);
            next.delete(subQuestionParent.id);
            return next;
          });
          toast.success("Sub-question created");
        } else {
          await createQuestion(values.questionText);
          toast.success("Question created");
        }
        handleCloseForm();
      } catch {
        toast.error(
          editingQuestion
            ? "Failed to update question"
            : subQuestionParent
              ? "Failed to create sub-question"
              : "Failed to create question",
        );
      }
    },
    [createQuestion, editingQuestion, subQuestionParent, updateQuestion],
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

  const handleMoveToParent = useCallback(
    async (questionId: string, parentId: string | null) => {
      setMovingUnderId(questionId);
      try {
        await moveToParent(questionId, parentId);
        if (parentId) {
          setCollapsedQuestionIds((current) => {
            const next = new Set(current);
            next.delete(parentId);
            return next;
          });
        }
        toast.success("Question moved");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to move question",
        );
      } finally {
        setMovingUnderId(null);
      }
    },
    [moveToParent],
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
      setCollapsedQuestionIds((current) => {
        const next = new Set(current);
        next.delete(deletingQuestion.id);
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

  const deleteSubCount = deletingQuestion
    ? countDescendantsInList(deletingQuestion.id, questions)
    : 0;

  const deleteMessage =
    deleteSubCount > 0
      ? `This question and all of its answers will be permanently removed. This will also delete ${deleteSubCount} sub-question${deleteSubCount === 1 ? "" : "s"}.`
      : "This question and all of its answers will be permanently removed.";

  const formTitle = editingQuestion
    ? "Edit question"
    : subQuestionParent
      ? "New sub-question"
      : "New question";

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
        collapsedQuestionIds={collapsedQuestionIds}
        projectId={projectId}
        onToggleExpand={handleToggleExpand}
        onToggleChildrenCollapse={handleToggleChildrenCollapse}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEdit}
        onDelete={setDeletingQuestion}
        onAddSubQuestion={handleAddSubQuestion}
        onMoveToParent={handleMoveToParent}
        allQuestions={questions}
        movingUnderId={movingUnderId}
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
        title={formTitle}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete question?"
        message={deleteMessage}
      />
    </div>
  );
}
