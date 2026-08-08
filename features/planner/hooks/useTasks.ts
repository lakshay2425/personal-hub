"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createTask as createTaskRepo,
  deleteTask as deleteTaskRepo,
  getBacklogTasks,
  getTasksForWeek,
  moveTaskToWeek as moveTaskToWeekRepo,
  toggleTaskComplete as toggleTaskCompleteRepo,
  updateTask as updateTaskRepo,
} from "../lib/tasksRepository";
import {
  sortCompletedTasks,
  sortTasksByPriority,
} from "../lib/weekUtils";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types";

export function useTasks(weekStart: string) {
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [week, backlog] = await Promise.all([
          getTasksForWeek(weekStart),
          getBacklogTasks(weekStart),
        ]);
        if (!cancelled) {
          setWeekTasks(week);
          setBacklogTasks(backlog);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tasks");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const reload = useCallback(async () => {
    const [week, backlog] = await Promise.all([
      getTasksForWeek(weekStart),
      getBacklogTasks(weekStart),
    ]);
    setWeekTasks(week);
    setBacklogTasks(backlog);
  }, [weekStart]);

  const activeTasks = sortTasksByPriority(
    weekTasks.filter((task) => task.status === "Todo"),
  );
  const completedTasks = sortCompletedTasks(
    weekTasks.filter((task) => task.status === "Done"),
  );
  const sortedBacklog = sortTasksByPriority(backlogTasks);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const created = await createTaskRepo(input);
      await reload();
      return created;
    },
    [reload],
  );

  const updateTask = useCallback(
    async (id: number, input: UpdateTaskInput) => {
      const updated = await updateTaskRepo(id, input);
      await reload();
      return updated;
    },
    [reload],
  );

  const toggleComplete = useCallback(
    async (task: Task, markDone: boolean) => {
      const updated = await toggleTaskCompleteRepo(task, markDone);
      await reload();
      return updated;
    },
    [reload],
  );

  const moveToWeek = useCallback(
    async (taskId: number, targetWeekStart: string) => {
      const updated = await moveTaskToWeekRepo(taskId, targetWeekStart);
      await reload();
      return updated;
    },
    [reload],
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      await deleteTaskRepo(taskId);
      await reload();
    },
    [reload],
  );

  return {
    activeTasks,
    completedTasks,
    backlogTasks: sortedBacklog,
    isLoading,
    error,
    createTask,
    updateTask,
    toggleComplete,
    moveToWeek,
    deleteTask,
    reload,
  };
}
