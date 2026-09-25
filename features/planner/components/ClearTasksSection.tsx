"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { clearAllTasks } from "../lib/tasksRepository";

export function ClearTasksSection() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllTasks();
      toast.success("All planner tasks cleared");
      setIsConfirmOpen(false);
    } catch {
      toast.error("Failed to clear tasks");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div className="max-w-xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Clear tasks
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Delete every planner task in this browser, including inbox, sprint,
            and recursive items.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Clear all tasks
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void handleConfirm()}
        title="Clear all tasks?"
        message="This deletes every planner task in this browser. Logger entries stay. This cannot be undone."
        confirmLabel="Clear all tasks"
        isLoading={isClearing}
        loadingLabel="Clearing…"
      />
    </>
  );
}
