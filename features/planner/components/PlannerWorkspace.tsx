"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useTasks } from "../hooks/useTasks";
import { getCurrentWeekStart } from "../lib/weekUtils";
import type { Task } from "../types";
import { BacklogSection } from "./BacklogSection";
import { CompletedTasksSection } from "./CompletedTasksSection";
import { TaskFormModal } from "./TaskFormModal";
import { TaskList } from "./TaskList";
import { WeekNavigation } from "./WeekNavigation";

export function PlannerWorkspace() {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    activeTasks,
    completedTasks,
    backlogTasks,
    isLoading,
    error,
    createTask,
    toggleComplete,
    moveToWeek,
    deleteTask,
  } = useTasks(weekStart);

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
        await moveToWeek(task.id!, weekStart);
        toast.success("Task moved to this week");
      } catch {
        toast.error("Failed to move task");
      }
    },
    [moveToWeek, weekStart],
  );

  const handleFormSubmit = useCallback(
    async (input: Parameters<typeof createTask>[0]) => {
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

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  return (
    <>
      <WeekNavigation
        weekStart={weekStart}
        onWeekChange={setWeekStart}
        onAddTask={() => setIsFormOpen(true)}
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          This Week
        </h2>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading tasks…
          </p>
        ) : (
          <>
            <TaskList
              tasks={activeTasks}
              onToggle={handleToggle}
              onDelete={setDeletingTask}
            />
            <CompletedTasksSection
              tasks={completedTasks}
              onToggle={handleToggle}
              onDelete={setDeletingTask}
            />
          </>
        )}
      </section>

      {!isLoading && (
        <BacklogSection
          tasks={backlogTasks}
          onToggle={handleToggle}
          onDelete={setDeletingTask}
          onMoveToWeek={handleMoveToWeek}
        />
      )}

      <TaskFormModal
        key={isFormOpen ? "open" : "closed"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultWeekStart={weekStart}
      />

      <ConfirmDialog
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        title="Delete task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
}
