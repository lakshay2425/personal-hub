"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useLogEntriesByDate } from "../hooks/useLogEntriesByDate";
import { formatLogDate, getTodayDateString } from "../lib/dateUtils";
import type { LogEntryFormValues } from "../schema";
import type { LogEntry } from "../types";
import { LogEntryFormModal } from "./LogEntryFormModal";
import { LogEntryList } from "./LogEntryList";

export function LoggerDashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const { entries, isLoading, error, updateEntry, deleteEntry } =
    useLogEntriesByDate(selectedDate);

  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormSubmit = useCallback(
    async (values: LogEntryFormValues) => {
      if (!editingEntry) return;

      if (values.date > getTodayDateString()) {
        toast.error("You can only log entries for today or past dates");
        return;
      }

      try {
        await updateEntry(editingEntry.id, values.date, values.text);
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"} on{" "}
          {formatLogDate(selectedDate)}
        </p>
      </div>

      <LogEntryList
        entries={entries}
        isLoading={isLoading}
        error={error}
        onEdit={setEditingEntry}
        onDelete={setDeletingEntry}
        groupByDate={false}
        emptyTitle="No entries on this date"
        emptyDescription="Try another date, or add entries from the Log tab."
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
