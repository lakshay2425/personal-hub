"use client";

import {
  addWeeks,
  formatWeekRange,
  getCurrentWeekStart,
  isCurrentWeek,
} from "@/features/job-search/lib/dateUtils";

interface WeekFilterProps {
  weekStart: string | null;
  onWeekChange: (weekStart: string | null) => void;
  label: string;
  count?: number;
}

export function WeekFilter({ weekStart, onWeekChange, label, count }: WeekFilterProps) {
  const isAllWeeks = weekStart === null;

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </span>
          <button
            type="button"
            onClick={() => onWeekChange(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isAllWeeks
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            All weeks
          </button>
          <button
            type="button"
            onClick={() => onWeekChange(getCurrentWeekStart())}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !isAllWeeks && weekStart && isCurrentWeek(weekStart)
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            This week
          </button>
          {count !== undefined && !isAllWeeks && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {!isAllWeeks && weekStart && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onWeekChange(addWeeks(weekStart, -1))}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              &lt; Prev
            </button>
            <span className="min-w-[200px] text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {formatWeekRange(weekStart)}
            </span>
            <button
              type="button"
              onClick={() => onWeekChange(addWeeks(weekStart, 1))}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
