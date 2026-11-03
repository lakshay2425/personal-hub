"use client";

import {
  addWeeks,
  formatWeekRange,
  getCurrentWeekStart,
} from "../lib/dateUtils";
import { getWeeklyLeadActivity } from "../lib/weeklyLeadActivity";
import type { LeadsViewMode } from "../lib/leadListUtils";
import type { LeadWithTouchpoints } from "../types";

interface WeeklyLeadActivityProps {
  leads: LeadWithTouchpoints[];
  weekStart: string;
  viewMode: LeadsViewMode;
  onWeekChange: (weekStart: string) => void;
}

export function WeeklyLeadActivity({
  leads,
  weekStart,
  viewMode,
  onWeekChange,
}: WeeklyLeadActivityProps) {
  const days = getWeeklyLeadActivity(leads, weekStart, viewMode);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const metricLabel =
    viewMode === "allLeads" ? "Leads added" : "Sent touchpoints";

  return (
    <section
      aria-label="Weekly activity"
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Weekly activity
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {metricLabel}: {total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous activity week"
            onClick={() => onWeekChange(addWeeks(weekStart, -1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            &lt; Prev
          </button>
          <span className="min-w-[180px] text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {formatWeekRange(weekStart)}
          </span>
          <button
            type="button"
            aria-label="Next activity week"
            onClick={() => onWeekChange(addWeeks(weekStart, 1))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next &gt;
          </button>
          {weekStart !== getCurrentWeekStart() ? (
            <button
              type="button"
              onClick={() => onWeekChange(getCurrentWeekStart())}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              This week
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => (
          <div
            key={day.date}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {day.weekday}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {day.dayOfMonth}
            </p>
            <p
              className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
              aria-label={`${day.count} ${metricLabel.toLowerCase()} on ${day.weekday}, ${day.date}`}
            >
              {day.count}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
