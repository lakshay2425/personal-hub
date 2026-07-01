"use client";

import type { Question } from "../types";
import { QuestionListItem } from "./QuestionListItem";

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  onToggleStatus: (id: string) => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  togglingId?: string | null;
}

export function QuestionList({
  questions,
  isLoading,
  error,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingId,
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
          No questions yet
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Click &quot;New Question&quot; to capture your first question.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {questions.map((question) => (
        <QuestionListItem
          key={question.id}
          questionText={question.questionText}
          status={question.status}
          onToggleStatus={() => onToggleStatus(question.id)}
          onEdit={() => onEdit(question)}
          onDelete={() => onDelete(question)}
          isToggling={togglingId === question.id}
        />
      ))}
    </ul>
  );
}
