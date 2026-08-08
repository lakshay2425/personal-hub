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
  onAddTask: () => void;
}

export function WeekNavigation({
  weekStart,
  onWeekChange,
  onAddTask,
}: WeekNavigationProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Planner
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Plan your week, track backlog, and log completions automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="w-full shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Task
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onWeekChange(addWeeks(weekStart, -1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            &lt; Prev Week
          </button>
          <span className="min-w-[200px] text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {formatWeekRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => onWeekChange(addWeeks(weekStart, 1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next Week &gt;
          </button>
        </div>

        {!isCurrentWeek(weekStart) && (
          <button
            type="button"
            onClick={() => onWeekChange(getCurrentWeekStart())}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            This Week
          </button>
        )}
      </div>
    </div>
  );
}
