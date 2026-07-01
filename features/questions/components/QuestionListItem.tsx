"use client";

import { StatusToggle } from "./StatusToggle";

interface QuestionListItemProps {
  questionText: string;
  status: "answered" | "unanswered";
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isToggling?: boolean;
}

export function QuestionListItem({
  questionText,
  status,
  onToggleStatus,
  onEdit,
  onDelete,
  isToggling = false,
}: QuestionListItemProps) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {questionText}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusToggle
            status={status}
            onToggle={onToggleStatus}
            disabled={isToggling}
          />
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit question"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete question"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
