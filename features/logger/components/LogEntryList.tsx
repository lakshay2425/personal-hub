"use client";

import { useMemo } from "react";

import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";

import { formatLogDate } from "../lib/dateUtils";
import type { LogEntry } from "../types";
import { LogEntryOverflowMenu } from "./LogEntryOverflowMenu";

interface LogEntryListProps {
  entries: LogEntry[];
  isLoading: boolean;
  error: string | null;
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
  groupByDate?: boolean;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelectionToggle?: (entryId: string) => void;
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
  groupByDate = true,
  selectionMode = false,
  selectedIds,
  onSelectionToggle,
  emptyTitle = "No log entries yet",
  emptyDescription = 'Click "New Entry" to log what you did.',
}: LogEntryListProps) {
  const { getColor, getDisplayName } = usePriorities();
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

  const renderEntry = (entry: LogEntry) => (
    <li
      key={entry.id}
      className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        {selectionMode ? (
          <input
            type="checkbox"
            checked={selectedIds?.has(entry.id) ?? false}
            onChange={() => onSelectionToggle?.(entry.id)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-label={`Select log entry on ${entry.date}`}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {entry.category ? (
            <div className="mb-2">
              <CategoryBadge
                category={entry.category}
                color={getColor(entry.category)}
                displayName={getDisplayName(entry.category)}
              />
            </div>
          ) : null}
          <p className="break-words text-sm text-zinc-900 dark:text-zinc-50">
            {entry.text}
          </p>
        </div>
        <LogEntryOverflowMenu
          entry={entry}
          onEdit={() => onEdit(entry)}
          onDelete={() => onDelete(entry)}
        />
      </div>
    </li>
  );

  if (!groupByDate) {
    return <ul className="space-y-3">{entries.map(renderEntry)}</ul>;
  }

  return (
    <div className="space-y-8">
      {groupedEntries.map((group) => (
        <section key={group.date}>
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {formatLogDate(group.date)}
          </h2>
          <ul className="space-y-3">
            {group.entries.map(renderEntry)}
          </ul>
        </section>
      ))}
    </div>
  );
}
