"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useTasks } from "../hooks/useTasks";
import type { CreateSubTaskInput, CreateTaskInput, Task, TaskKind } from "../types";
import { getDeleteWarningMessage } from "../lib/deleteTaskMessage";
import { PlannerKindSection } from "./PlannerKindSection";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskFormModal } from "./TaskFormModal";
import { TaskNotesModal } from "./TaskNotesModal";

export function PlannerWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subTaskParent, setSubTaskParent] = useState<Task | null>(null);
  const [notesTask, setNotesTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    tasks,
    inboxActive,
    inboxCompleted,
    sprintActive,
    sprintCompleted,
    recursiveTasks,
    isLoading,
    error,
    createTask,
    createSubTask,
    updateTask,
    toggleComplete,
    moveKind,
    reorderTasks,
    deleteTask,
  } = useTasks();

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

  const handleMoveKind = useCallback(
    async (task: Task, kind: TaskKind) => {
      try {
        await moveKind(task.id!, kind);
        const labels = {
          inbox: "Inbox",
          sprint: "Sprint",
          recursive: "Recursive",
        };
        toast.success(`Moved to ${labels[kind]}`);
      } catch {
        toast.error("Failed to move task");
      }
    },
    [moveKind],
  );

  const handleCreateTask = useCallback(
    async (input: CreateTaskInput) => {
      try {
        await createTask(input);
        toast.success("Task logged");
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
    async (parentId: number | null, orderedIds: number[]) => {
      try {
        await reorderTasks(parentId, orderedIds);
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

  const sectionHandlers = {
    onToggle: handleToggle,
    onEdit: handleEdit,
    onDelete: setDeletingTask,
    onAddSubTask: handleAddSubTask,
    onMoveKind: handleMoveKind,
    onViewNotes: setNotesTask,
    onViewDetail: setDetailTask,
    onReorder: handleReorder,
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openCreateForm}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Task
        </button>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading tasks…
        </p>
      ) : (
        <div className="space-y-10">
          <PlannerKindSection
            title="Inbox"
            description="Log the task. Classify it later."
            tasks={inboxActive}
            completedTasks={inboxCompleted}
            emptyMessage="No tasks waiting. Capture whatever you want to do."
            completedEmptyMessage="No completed inbox tasks."
            {...sectionHandlers}
          />
          <PlannerKindSection
            title="Sprint"
            description="One-time investments. Finishing the work ends it."
            tasks={sprintActive}
            completedTasks={sprintCompleted}
            emptyMessage="No sprint tasks. Move a one-of-a-kind investment here."
            completedEmptyMessage="No finished sprints yet."
            {...sectionHandlers}
          />
          <PlannerKindSection
            title="Recursive"
            description="Ongoing practices. Completing a slice leaves the practice open."
            tasks={recursiveTasks}
            emptyMessage="No recursive tasks. Move a practice you keep doing here."
            {...sectionHandlers}
          />
        </div>
      )}

      <TaskFormModal
        key={`${formModalKey}-${isFormOpen}`}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateTask}
        onUpdate={handleUpdateTask}
        onCreateSubTask={handleCreateSubTask}
        task={editingTask}
        subTaskParent={subTaskParent}
      />

      <TaskDetailModal
        isOpen={detailTask !== null}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        allTasks={tasks}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onAddSubTask={handleAddSubTask}
        onViewNotes={setNotesTask}
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
            ? getDeleteWarningMessage(deletingTask, tasks)
            : ""
        }
        isLoading={isDeleting}
      />
    </>
  );
}
