"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BulkActionBar } from "@/features/shared/components/BulkActionBar";
import { useBulkSelection } from "@/features/shared/hooks/useBulkSelection";
import { UNASSIGNED } from "@/features/settings/types";

import { useTasks } from "../hooks/useTasks";
import { getCurrentWeekStart } from "../lib/weekUtils";
import type { CreateSubTaskInput, CreateTaskInput, Task } from "../types";
import { getDeleteWarningMessage } from "../lib/deleteTaskMessage";
import { BacklogTab } from "./BacklogTab";
import { PlannerTabNav, type PlannerTab } from "./PlannerTabNav";
import { TaskFormModal } from "./TaskFormModal";
import { TaskNotesModal } from "./TaskNotesModal";
import { TasksView } from "./TasksView";
import { UpcomingTab } from "./UpcomingTab";
import { WeekNavigation } from "./WeekNavigation";

export function PlannerWorkspace() {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [activeTab, setActiveTab] = useState<PlannerTab>("today");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subTaskParent, setSubTaskParent] = useState<Task | null>(null);
  const [notesTask, setNotesTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  const {
    selectedIds,
    selectedCount,
    toggle: toggleSelection,
    clear: clearSelection,
  } = useBulkSelection<number>();

  const {
    weekTasks,
    activeTasks,
    completedTasks,
    backlogTasks,
    backlogCount,
    upcomingByWeek,
    isLoading,
    error,
    currentWeekStart,
    createTask,
    createSubTask,
    updateTask,
    toggleComplete,
    moveToWeek,
    reorderTasks,
    deleteTask,
    updateTaskCategory,
    bulkUpdateTaskCategory,
  } = useTasks(weekStart);

  const allTasks = useMemo(() => {
    const upcomingFlat = [...upcomingByWeek.values()].flat();
    const merged = new Map<number, Task>();
    for (const task of [...weekTasks, ...backlogTasks, ...upcomingFlat]) {
      if (task.id !== undefined) {
        merged.set(task.id, task);
      }
    }
    return [...merged.values()];
  }, [weekTasks, backlogTasks, upcomingByWeek]);

  const selectionProps = {
    selectionMode,
    selectedIds,
    onSelectionToggle: toggleSelection,
  };

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
    setSubTaskParent(null);
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingTask(null);
    setSubTaskParent(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setSubTaskParent(null);
    setIsFormOpen(true);
  }, []);

  const handleAddSubTask = useCallback((task: Task) => {
    setSubTaskParent(task);
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleToggle = useCallback(
    async (task: Task, markDone: boolean) => {
      try {
        await toggleComplete(task, markDone);
        if (markDone) {
          toast.success("Task completed and added to today's log");
        }
      } catch {
        toast.error("Failed to update task");
      }
    },
    [toggleComplete],
  );

  const handleMoveToCategory = useCallback(
    async (task: Task, category: string) => {
      try {
        await updateTaskCategory(task.id!, category);
        toast.success("Task moved to category");
      } catch {
        toast.error("Failed to move task");
      }
    },
    [updateTaskCategory],
  );

  const handleBulkApplyCategory = useCallback(
    async (category: string) => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;

      setIsBulkApplying(true);
      try {
        await bulkUpdateTaskCategory(ids, category || UNASSIGNED);
        toast.success(`Updated category for ${ids.length} task(s)`);
        clearSelection();
        setSelectionMode(false);
      } catch {
        toast.error("Failed to update categories");
      } finally {
        setIsBulkApplying(false);
      }
    },
    [bulkUpdateTaskCategory, clearSelection, selectedIds],
  );

  const handleMoveToWeek = useCallback(
    async (task: Task) => {
      try {
        await moveToWeek(task.id!, currentWeekStart);
        toast.success("Task moved to this week");
      } catch {
        toast.error("Failed to move task");
      }
    },
    [moveToWeek, currentWeekStart],
  );

  const handleCreateTask = useCallback(
    async (input: CreateTaskInput) => {
      try {
        await createTask(input);
        toast.success("Task created");
      } catch {
        toast.error("Failed to create task");
        throw new Error("Failed to create task");
      }
    },
    [createTask],
  );

  const handleUpdateTask = useCallback(
    async (id: number, input: Parameters<typeof updateTask>[1]) => {
      try {
        await updateTask(id, input);
        toast.success("Task updated");
      } catch {
        toast.error("Failed to update task");
        throw new Error("Failed to update task");
      }
    },
    [updateTask],
  );

  const handleCreateSubTask = useCallback(
    async (parentId: number, input: CreateSubTaskInput) => {
      try {
        await createSubTask(parentId, input);
        toast.success("Sub-task created");
      } catch {
        toast.error("Failed to create sub-task");
        throw new Error("Failed to create sub-task");
      }
    },
    [createSubTask],
  );

  const handleReorder = useCallback(
    async (
      parentId: number | null,
      weekStartValue: string,
      orderedIds: number[],
    ) => {
      try {
        await reorderTasks(parentId, weekStartValue, orderedIds);
      } catch {
        toast.error("Failed to reorder tasks");
      }
    },
    [reorderTasks],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTask?.id) return;

    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      toast.success("Task deleted");
      setDeletingTask(null);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTask, deletingTask]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  const defaultFormWeek =
    activeTab === "today" ? weekStart : currentWeekStart;

  const formModalKey = editingTask
    ? `edit-${editingTask.id}`
    : subTaskParent
      ? `sub-${subTaskParent.id}`
      : "create";

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  const treeHandlers = {
    onToggle: handleToggle,
    onEdit: handleEdit,
    onDelete: setDeletingTask,
    onAddSubTask: handleAddSubTask,
    onMoveToCategory: handleMoveToCategory,
    onViewNotes: setNotesTask,
    onReorder: handleReorder,
    ...selectionProps,
  };

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
          onClick={openCreateForm}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Task
        </button>
      </div>

      <PlannerTabNav
        activeTab={activeTab}
        backlogCount={backlogCount}
        onTabChange={setActiveTab}
      />

      {isLoading ? (
        <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading tasks…
        </p>
      ) : (
        <>
          {activeTab === "today" && (
            <>
              <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />
              <TasksView
                pendingTasks={activeTasks}
                completedTasks={completedTasks}
                onAddTask={openCreateForm}
                {...treeHandlers}
              />
            </>
          )}

          {activeTab === "backlog" && (
            <BacklogTab
              tasks={backlogTasks}
              {...treeHandlers}
              onMoveToWeek={handleMoveToWeek}
            />
          )}

          {activeTab === "upcoming" && (
            <UpcomingTab tasksByWeek={upcomingByWeek} {...treeHandlers} />
          )}
        </>
      )}

      <BulkActionBar
        selectedCount={selectedCount}
        onApply={handleBulkApplyCategory}
        onClear={clearSelection}
        isApplying={isBulkApplying}
      />

      <TaskFormModal
        key={`${formModalKey}-${isFormOpen}`}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateTask}
        onUpdate={handleUpdateTask}
        onCreateSubTask={handleCreateSubTask}
        defaultWeekStart={defaultFormWeek}
        task={editingTask}
        subTaskParent={subTaskParent}
      />

      <TaskNotesModal
        isOpen={notesTask !== null}
        onClose={() => setNotesTask(null)}
        title={notesTask?.title ?? ""}
        notes={notesTask?.notes ?? ""}
      />

      <ConfirmDialog
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        title="Delete task"
        message={
          deletingTask
            ? getDeleteWarningMessage(deletingTask, allTasks)
            : ""
        }
        isLoading={isDeleting}
      />
    </>
  );
}
