"use client";

import {
  addWeeks,
  formatWeekRange,
  getCurrentWeekStart,
  isCurrentWeek,
} from "../lib/weekUtils";

interface WeekNavigationProps {
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
}

export function WeekNavigation({ weekStart, onWeekChange }: WeekNavigationProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onWeekChange(addWeeks(weekStart, -1))}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          &lt; Prev
        </button>
        <span className="min-w-[200px] text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={() => onWeekChange(addWeeks(weekStart, 1))}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next &gt;
        </button>
      </div>

      {!isCurrentWeek(weekStart) && (
        <button
          type="button"
          onClick={() => onWeekChange(getCurrentWeekStart())}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Today
        </button>
      )}
    </div>
  );
}
