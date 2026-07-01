"use client";

import type { QuestionStatus } from "../types";

interface StatusToggleProps {
  status: QuestionStatus;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggle({
  status,
  onToggle,
  disabled = false,
}: StatusToggleProps) {
  const isAnswered = status === "answered";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Mark as ${isAnswered ? "unanswered" : "answered"}`}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        isAnswered
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          : "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
      }`}
    >
      {isAnswered ? "Answered" : "Unanswered"}
    </button>
  );
}
