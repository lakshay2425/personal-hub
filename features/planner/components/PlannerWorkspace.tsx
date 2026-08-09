"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useTasks } from "../hooks/useTasks";
import { getCurrentWeekStart } from "../lib/weekUtils";
import type { CreateSubTaskInput, CreateTaskInput, Task } from "../types";
import { BacklogTab } from "./BacklogTab";
import {
  CompletedTasksSection,
  getDeleteWarningMessage,
} from "./CompletedTasksSection";
import { PlannerTabNav, type PlannerTab } from "./PlannerTabNav";
import { TaskFormModal } from "./TaskFormModal";
import { TaskList } from "./TaskList";
import { TaskNotesModal } from "./TaskNotesModal";
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
    onViewNotes: setNotesTask,
    onReorder: handleReorder,
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Planner
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Plan your week with sub-tasks, drag reorder, and automatic log entries on completion.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="w-full shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
              <TaskList tasks={activeTasks} {...treeHandlers} />
              <CompletedTasksSection
                tasks={completedTasks}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={setDeletingTask}
                onAddSubTask={handleAddSubTask}
                onViewNotes={setNotesTask}
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
