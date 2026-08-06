"use client";

import { useMemo } from "react";

import { formatLogDate } from "../lib/dateUtils";
import type { LogEntry } from "../types";

interface LogEntryListProps {
  entries: LogEntry[];
  isLoading: boolean;
  error: string | null;
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function groupEntriesByDate(
  entries: LogEntry[],
): { date: string; entries: LogEntry[] }[] {
  const groups = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const existing = groups.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.date, [entry]);
    }
  }

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries.sort((a, b) => b.createdAt - a.createdAt),
    }));
}

export function LogEntryList({
  entries,
  isLoading,
  error,
  onEdit,
  onDelete,
  emptyTitle = "No log entries yet",
  emptyDescription = 'Click "New Entry" to log what you did.',
}: LogEntryListProps) {
  const groupedEntries = useMemo(() => groupEntriesByDate(entries), [entries]);

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

  if (entries.length === 0) {
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
    <div className="space-y-8">
      {groupedEntries.map((group) => (
        <section key={group.date}>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {formatLogDate(group.date)}
          </h2>
          <ul className="space-y-3">
            {group.entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="min-w-0 flex-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {entry.text}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
