"use client";

import type { CalendarViewMode } from "../../types";

interface CalendarViewToggleProps {
  viewMode: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
}

const MODES: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

export function CalendarViewToggle({ viewMode, onChange }: CalendarViewToggleProps) {
  return (
    <div
      className="inline-flex w-full rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 sm:w-auto dark:border-zinc-700 dark:bg-zinc-800/50"
      role="group"
      aria-label="Calendar view"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
            viewMode === mode.value
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
          aria-pressed={viewMode === mode.value}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
