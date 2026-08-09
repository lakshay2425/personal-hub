"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useTasks } from "../hooks/useTasks";
import { getCurrentWeekStart } from "../lib/weekUtils";
import type { Task } from "../types";
import { BacklogTab } from "./BacklogTab";
import { CompletedTasksSection } from "./CompletedTasksSection";
import { PlannerTabNav, type PlannerTab } from "./PlannerTabNav";
import { TaskFormModal } from "./TaskFormModal";
import { TaskList } from "./TaskList";
import { UpcomingTab } from "./UpcomingTab";
import { WeekNavigation } from "./WeekNavigation";

export function PlannerWorkspace() {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [activeTab, setActiveTab] = useState<PlannerTab>("today");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    activeTasks,
    completedTasks,
    backlogTasks,
    backlogCount,
    upcomingByWeek,
    isLoading,
    error,
    currentWeekStart,
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
        await moveToWeek(task.id!, currentWeekStart);
        toast.success("Task moved to this week");
      } catch {
        toast.error("Failed to move task");
      }
    },
    [moveToWeek, currentWeekStart],
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

  const defaultFormWeek =
    activeTab === "today" ? weekStart : currentWeekStart;

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Planner
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Plan your week, track backlog, and log completions automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
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

          {activeTab === "backlog" && (
            <BacklogTab
              tasks={backlogTasks}
              onToggle={handleToggle}
              onDelete={setDeletingTask}
              onMoveToWeek={handleMoveToWeek}
            />
          )}

          {activeTab === "upcoming" && (
            <UpcomingTab
              tasksByWeek={upcomingByWeek}
              onToggle={handleToggle}
              onDelete={setDeletingTask}
            />
          )}
        </>
      )}

      <TaskFormModal
        key={isFormOpen ? "open" : "closed"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultWeekStart={defaultFormWeek}
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
