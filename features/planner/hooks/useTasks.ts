"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createTask as createTaskRepo,
  deleteTask as deleteTaskRepo,
  getBacklogTasks,
  getTasksForWeek,
  getUpcomingTasks,
  moveTaskToWeek as moveTaskToWeekRepo,
  toggleTaskComplete as toggleTaskCompleteRepo,
  updateTask as updateTaskRepo,
} from "../lib/tasksRepository";
import {
  getCurrentWeekStart,
  groupTasksByWeek,
  sortBacklogTasks,
  sortCompletedTasks,
  sortTasksByPriority,
} from "../lib/weekUtils";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types";

export function useTasks(viewedWeekStart: string) {
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentWeekStart = getCurrentWeekStart();

  const loadAll = useCallback(async () => {
    const currentWeek = getCurrentWeekStart();
    const [week, backlog, upcoming] = await Promise.all([
      getTasksForWeek(viewedWeekStart),
      getBacklogTasks(currentWeek),
      getUpcomingTasks(currentWeek),
    ]);
    setWeekTasks(week);
    setBacklogTasks(backlog);
    setUpcomingTasks(upcoming);
  }, [viewedWeekStart]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const currentWeek = getCurrentWeekStart();
        const [week, backlog, upcoming] = await Promise.all([
          getTasksForWeek(viewedWeekStart),
          getBacklogTasks(currentWeek),
          getUpcomingTasks(currentWeek),
        ]);
        if (!cancelled) {
          setWeekTasks(week);
          setBacklogTasks(backlog);
          setUpcomingTasks(upcoming);
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
  }, [viewedWeekStart]);

  const activeTasks = sortTasksByPriority(
    weekTasks.filter((task) => task.status === "Todo"),
  );
  const completedTasks = sortCompletedTasks(
    weekTasks.filter((task) => task.status === "Done"),
  );
  const sortedBacklog = sortBacklogTasks(backlogTasks);
  const upcomingByWeek = useMemo(
    () => groupTasksByWeek(upcomingTasks),
    [upcomingTasks],
  );

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const created = await createTaskRepo(input);
      await loadAll();
      return created;
    },
    [loadAll],
  );

  const updateTask = useCallback(
    async (id: number, input: UpdateTaskInput) => {
      const updated = await updateTaskRepo(id, input);
      await loadAll();
      return updated;
    },
    [loadAll],
  );

  const toggleComplete = useCallback(
    async (task: Task, markDone: boolean) => {
      const updated = await toggleTaskCompleteRepo(task, markDone);
      await loadAll();
      return updated;
    },
    [loadAll],
  );

  const moveToWeek = useCallback(
    async (taskId: number, targetWeekStart: string) => {
      const updated = await moveTaskToWeekRepo(taskId, targetWeekStart);
      await loadAll();
      return updated;
    },
    [loadAll],
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      await deleteTaskRepo(taskId);
      await loadAll();
    },
    [loadAll],
  );

  return {
    activeTasks,
    completedTasks,
    backlogTasks: sortedBacklog,
    backlogCount: sortedBacklog.length,
    upcomingByWeek,
    isLoading,
    error,
    currentWeekStart,
    createTask,
    updateTask,
    toggleComplete,
    moveToWeek,
    deleteTask,
    reload: loadAll,
  };
}
