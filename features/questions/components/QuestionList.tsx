"use client";

import type { Question } from "../types";
import { QuestionListItem } from "./QuestionListItem";

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  answerCounts: Record<string, number>;
  expandedQuestionId: string | null;
  projectId: string | null;
  onToggleExpand: (questionId: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
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
  projectId,
  onToggleExpand,
  onToggleStatus,
  onEdit,
  onDelete,
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

  if (questions.length === 0) {
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
      {questions.map((question) => (
        <QuestionListItem
          key={question.id}
          question={question}
          answerCount={answerCounts[question.id] ?? 0}
          isExpanded={expandedQuestionId === question.id}
          onToggleExpand={() => onToggleExpand(question.id)}
          onToggleStatus={() => onToggleStatus(question.id)}
          onEdit={() => onEdit(question)}
          onDelete={() => onDelete(question)}
          isToggling={togglingId === question.id}
          projectId={projectId}
          onAnswerCountChange={onAnswerCountChange}
        />
      ))}
    </ul>
  );
}
