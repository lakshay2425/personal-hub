"use client";

import type { Answer } from "../types";

interface AnswerListProps {
  answers: Answer[];
  isLoading: boolean;
  error: string | null;
  onEdit: (answer: Answer) => void;
  onDelete: (answer: Answer) => void;
}

export function AnswerList({
  answers,
  isLoading,
  error,
  onEdit,
  onDelete,
}: AnswerListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  if (answers.length === 0) {
    return (
      <p className="py-2 text-sm text-zinc-500 dark:text-zinc-400">
        No answers yet. Add a titled answer like &quot;30-second answer&quot; or
        &quot;60-second answer&quot;.
      </p>
    );
  }

  return (
    <ul className="space-y-2 py-2">
      {answers.map((answer) => (
        <li
          key={answer.id}
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {answer.title}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {answer.body}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(answer)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-white dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(answer)}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
