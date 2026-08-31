"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BulkActionBar } from "@/features/shared/components/BulkActionBar";
import { useBulkSelection } from "@/features/shared/hooks/useBulkSelection";
import { UNASSIGNED } from "@/features/settings/types";

import { useLogEntriesByDate } from "../hooks/useLogEntriesByDate";
import { formatLogDate, getTodayDateString } from "../lib/dateUtils";
import type { LogEntryFormValues } from "../schema";
import type { LogEntry } from "../types";
import { LogEntryFormModal } from "./LogEntryFormModal";
import { LogEntryList } from "./LogEntryList";

export function LoggerDashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const {
    entries,
    isLoading,
    error,
    updateEntry,
    deleteEntry,
    bulkUpdateCategory,
  } = useLogEntriesByDate(selectedDate);

  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  const {
    selectedIds,
    selectedCount,
    toggle: toggleSelection,
    clear: clearSelection,
  } = useBulkSelection<string>();

  const handleFormSubmit = useCallback(
    async (values: LogEntryFormValues) => {
      if (!editingEntry) return;

      if (values.date > getTodayDateString()) {
        toast.error("You can only log entries for today or past dates");
        return;
      }

      try {
        await updateEntry(
          editingEntry.id,
          values.date,
          values.text,
          values.category?.trim() || undefined,
        );
        toast.success("Entry updated");
        setEditingEntry(null);
      } catch {
        toast.error("Failed to update entry");
      }
    },
    [editingEntry, updateEntry],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingEntry) return;

    setIsDeleting(true);
    try {
      await deleteEntry(deletingEntry.id);
      toast.success("Entry deleted");
      setDeletingEntry(null);
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteEntry, deletingEntry]);

  const handleBulkApplyCategory = useCallback(
    async (category: string) => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;

      setIsBulkApplying(true);
      try {
        const normalized =
          category === "" ? undefined : category || UNASSIGNED;
        await bulkUpdateCategory(ids, normalized);
        toast.success(`Updated category for ${ids.length} entr${ids.length === 1 ? "y" : "ies"}`);
        clearSelection();
        setSelectionMode(false);
      } catch {
        toast.error("Failed to update categories");
      } finally {
        setIsBulkApplying(false);
      }
    },
    [bulkUpdateCategory, clearSelection, selectedIds],
  );

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="dashboard-date"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Date
          </label>
          <input
            id="dashboard-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:w-auto dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={toggleSelectionMode}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selectionMode
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {selectionMode ? "Cancel Select" : "Select"}
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {entries.length}{" "}
            {entries.length === 1 ? "entry" : "entries"} on{" "}
            {formatLogDate(selectedDate)}
          </p>
        </div>
      </div>

      <LogEntryList
        entries={entries}
        isLoading={isLoading}
        error={error}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionToggle={toggleSelection}
        onEdit={setEditingEntry}
        onDelete={setDeletingEntry}
        groupByDate={false}
        emptyTitle="No entries on this date"
        emptyDescription="Try another date, or add entries from the Log tab."
      />

      <BulkActionBar
        selectedCount={selectedCount}
        onApply={handleBulkApplyCategory}
        onClear={clearSelection}
        includeNone
        noneLabel="None"
        isApplying={isBulkApplying}
      />

      <LogEntryFormModal
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleFormSubmit}
        entry={editingEntry}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete entry?"
        message="This log entry will be permanently removed."
      />
    </>
  );
}
