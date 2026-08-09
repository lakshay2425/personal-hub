"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createSubTask as createSubTaskRepo,
  createTask as createTaskRepo,
  deleteTask as deleteTaskRepo,
  getBacklogTasks,
  getTasksForWeek,
  getUpcomingTasks,
  moveTaskToWeek as moveTaskToWeekRepo,
  reorderTasks as reorderTasksRepo,
  toggleTaskComplete as toggleTaskCompleteRepo,
  updateTask as updateTaskRepo,
} from "../lib/tasksRepository";
import {
  getCurrentWeekStart,
  groupTasksByWeek,
  sortBacklogTasks,
  sortCompletedTasks,
  sortTasksByOrder,
} from "../lib/weekUtils";
import type {
  CreateSubTaskInput,
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "../types";

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

  const activeTasks = useMemo(
    () => sortTasksByOrder(weekTasks.filter((task) => task.status === "Todo")),
    [weekTasks],
  );
  const completedTasks = useMemo(
    () =>
      sortCompletedTasks(
        weekTasks.filter((task) => task.status === "Done"),
      ),
    [weekTasks],
  );
  const sortedBacklog = useMemo(
    () => sortBacklogTasks(backlogTasks),
    [backlogTasks],
  );
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

  const createSubTask = useCallback(
    async (parentId: number, input: CreateSubTaskInput) => {
      const created = await createSubTaskRepo(parentId, input);
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

  const reorderTasks = useCallback(
    async (
      parentId: number | null,
      weekStart: string,
      orderedIds: number[],
    ) => {
      await reorderTasksRepo(parentId, weekStart, orderedIds);
      await loadAll();
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
    weekTasks,
    activeTasks,
    completedTasks,
    backlogTasks: sortedBacklog,
    backlogCount: sortedBacklog.length,
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
    reload: loadAll,
  };
}
