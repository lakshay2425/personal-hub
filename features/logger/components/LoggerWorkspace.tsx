"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useLogEntries } from "../hooks/useLogEntries";
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
      try {
        if (editingEntry) {
          await updateEntry(editingEntry.id, values.date, values.text);
          toast.success("Entry updated");
        } else {
          await createEntry(values.date, values.text);
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
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleOpenCreate}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Entry
        </button>
      </div>

      <LogEntryList
        entries={entries}
        isLoading={isLoading}
        error={error}
        onEdit={setEditingEntry}
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
