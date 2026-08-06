"use client";

import type { QuestionTreeNode } from "../types";
import { buildQuestionTree } from "../lib/questionTree";
import { QuestionListItem } from "./QuestionListItem";

interface QuestionListProps {
  questions: Parameters<typeof buildQuestionTree>[0];
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

  const tree = buildQuestionTree(questions);

  if (tree.length === 0) {
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
    <ul className="space-y-3">
      {tree.map((node) => (
        <QuestionListItem
          key={node.id}
          node={node}
          answerCount={answerCounts[node.id] ?? 0}
          isExpanded={expandedQuestionId === node.id}
          isChildrenCollapsed={collapsedQuestionIds.has(node.id)}
          onToggleExpand={onToggleExpand}
          onToggleChildrenCollapse={onToggleChildrenCollapse}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubQuestion={onAddSubQuestion}
          isToggling={togglingId === node.id}
          projectId={projectId}
          onAnswerCountChange={onAnswerCountChange}
          collapsedQuestionIds={collapsedQuestionIds}
          expandedQuestionId={expandedQuestionId}
          answerCounts={answerCounts}
          togglingId={togglingId}
        />
      ))}
    </ul>
  );
}
