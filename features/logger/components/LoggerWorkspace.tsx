"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { exportLoggerData } from "../lib/exportRepository";
import {
  importLoggerData,
  validateLoggerBackup,
} from "../lib/importRepository";
import { useLogEntries } from "../hooks/useLogEntries";
import { getTodayDateString } from "../lib/dateUtils";
import type { LogEntryFormValues } from "../schema";
import type { LogEntry } from "../types";
import { LogEntryFormModal } from "./LogEntryFormModal";
import { LogEntryList } from "./LogEntryList";

export function LoggerWorkspace() {
  const { entries, isLoading, error, createEntry, updateEntry, deleteEntry } =
    useLogEntries();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleFormSubmit = useCallback(
    async (values: LogEntryFormValues) => {
      if (values.date > getTodayDateString()) {
        toast.error("You can only log entries for today or past dates");
        return;
      }

      const category = values.category?.trim() || undefined;

      try {
        if (editingEntry) {
          await updateEntry(
            editingEntry.id,
            values.date,
            values.text,
            category,
          );
          toast.success("Entry updated");
        } else {
          await createEntry(values.date, values.text, category);
          toast.success("Entry created");
        }
        handleCloseForm();
      } catch {
        toast.error(
          editingEntry ? "Failed to update entry" : "Failed to create entry",
        );
      }
    },
    [createEntry, editingEntry, updateEntry],
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <ExportButton
            onExport={exportLoggerData}
            filenamePrefix="question-hub-logger"
            className="w-full shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          />
          <ImportButton
            onValidate={validateLoggerBackup}
            onImport={importLoggerData}
            onImported={() => window.location.reload()}
            className="w-full shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          />
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Entry
        </button>
      </div>

      <LogEntryList
        entries={entries}
        isLoading={isLoading}
        error={error}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsFormOpen(true);
        }}
        onDelete={setDeletingEntry}
        emptyTitle="No log entries yet"
        emptyDescription='Click "New Entry" to log what you did today.'
      />

      <LogEntryFormModal
        isOpen={isFormOpen || Boolean(editingEntry)}
        onClose={handleCloseForm}
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
