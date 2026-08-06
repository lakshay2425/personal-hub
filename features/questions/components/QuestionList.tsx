"use client";

import type { Question, QuestionTreeNode } from "../types";
import { SortableQuestionList } from "./SortableQuestionList";

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  answerCounts: Record<string, number>;
  expandedQuestionId: string | null;
  collapsedQuestionIds: Set<string>;
  projectId: string | null;
  onToggleExpand: (questionId: string) => void;
  onToggleChildrenCollapse: (questionId: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (question: QuestionTreeNode) => void;
  onDelete: (question: QuestionTreeNode) => void;
  onAddSubQuestion: (parent: QuestionTreeNode) => void;
  onMoveToParent: (questionId: string, parentId: string | null) => Promise<void>;
  onReorder: (parentId: string | null, orderedIds: string[]) => Promise<void>;
  allQuestions: Question[];
  movingUnderId?: string | null;
  onAnswerCountChange?: (questionId: string, count: number) => void;
  togglingId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function QuestionList({
  questions,
  isLoading,
  error,
  answerCounts,
  expandedQuestionId,
  collapsedQuestionIds,
  projectId,
  onToggleExpand,
  onToggleChildrenCollapse,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddSubQuestion,
  onMoveToParent,
  onReorder,
  allQuestions,
  movingUnderId,
  onAnswerCountChange,
  togglingId,
  emptyTitle = "No questions yet",
  emptyDescription = 'Click "New Question" to capture your first question.',
}: QuestionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  const treeLength = questions.filter((question) => question.parentId === null).length;

  if (treeLength === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {emptyTitle}
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <SortableQuestionList
      questions={questions}
      answerCounts={answerCounts}
      expandedQuestionId={expandedQuestionId}
      collapsedQuestionIds={collapsedQuestionIds}
      projectId={projectId}
      onToggleExpand={onToggleExpand}
      onToggleChildrenCollapse={onToggleChildrenCollapse}
      onToggleStatus={onToggleStatus}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddSubQuestion={onAddSubQuestion}
      onMoveToParent={onMoveToParent}
      onReorder={onReorder}
      allQuestions={allQuestions}
      movingUnderId={movingUnderId}
      onAnswerCountChange={onAnswerCountChange}
      togglingId={togglingId}
    />
  );
}
