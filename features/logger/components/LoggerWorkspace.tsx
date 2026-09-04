"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BulkActionBar } from "@/features/shared/components/BulkActionBar";
import { useBulkSelection } from "@/features/shared/hooks/useBulkSelection";
import { UNASSIGNED } from "@/features/settings/types";

import { useLogEntries } from "../hooks/useLogEntries";
import { getTodayDateString } from "../lib/dateUtils";
import type { LogEntryFormValues } from "../schema";
import type { LogEntry } from "../types";
import { LogEntryFormModal } from "./LogEntryFormModal";
import { LogEntryList } from "./LogEntryList";

export function LoggerWorkspace() {
  const {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    bulkUpdateCategory,
  } = useLogEntries();

  const [isFormOpen, setIsFormOpen] = useState(false);
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={toggleSelectionMode}
          className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${
            selectionMode
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {selectionMode ? "Cancel Select" : "Select"}
        </button>
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
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionToggle={toggleSelection}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsFormOpen(true);
        }}
        onDelete={setDeletingEntry}
        emptyTitle="No log entries yet"
        emptyDescription='Click "New Entry" to log what you did today.'
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
