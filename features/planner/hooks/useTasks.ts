"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createSubTask as createSubTaskRepo,
  createTask as createTaskRepo,
  deleteTask as deleteTaskRepo,
  getAllTasks,
  moveTaskKind as moveTaskKindRepo,
  reorderTasks as reorderTasksRepo,
  toggleTaskComplete as toggleTaskCompleteRepo,
  updateTask as updateTaskRepo,
} from "../lib/tasksRepository";
import { compareTasks } from "../lib/taskTree";
import type {
  CreateSubTaskInput,
  CreateTaskInput,
  Task,
  TaskKind,
  UpdateTaskInput,
} from "../types";

function tasksOfKind(tasks: Task[], kind: TaskKind): Task[] {
  return tasks.filter((task) => task.kind === kind).sort(compareTasks);
}

function treesForRoots(tasks: Task[], roots: Task[]): Task[] {
  const included = new Set<number>();

  function addDescendants(parentId: number) {
    for (const task of tasks) {
      if (task.parentId === parentId && task.id !== undefined) {
        included.add(task.id);
        addDescendants(task.id);
      }
    }
  }

  for (const root of roots) {
    if (root.id !== undefined) {
      included.add(root.id);
      addDescendants(root.id);
    }
  }

  return tasks.filter((task) => task.id !== undefined && included.has(task.id));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const all = await getAllTasks();
    setTasks(all);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const all = await getAllTasks();
        if (!cancelled) {
          setTasks(all);
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
  }, []);

  const inboxTasks = useMemo(() => tasksOfKind(tasks, "inbox"), [tasks]);
  const sprintTasks = useMemo(() => tasksOfKind(tasks, "sprint"), [tasks]);
  const recursiveTasks = useMemo(
    () => tasksOfKind(tasks, "recursive"),
    [tasks],
  );

  const inboxActive = useMemo(() => {
    const roots = inboxTasks.filter(
      (task) => (task.parentId ?? null) === null && task.status === "Todo",
    );
    return treesForRoots(inboxTasks, roots);
  }, [inboxTasks]);

  const inboxCompleted = useMemo(() => {
    const roots = inboxTasks.filter(
      (task) => (task.parentId ?? null) === null && task.status === "Done",
    );
    return treesForRoots(inboxTasks, roots);
  }, [inboxTasks]);

  const sprintActive = useMemo(() => {
    const roots = sprintTasks.filter(
      (task) => (task.parentId ?? null) === null && task.status === "Todo",
    );
    return treesForRoots(sprintTasks, roots);
  }, [sprintTasks]);

  const sprintCompleted = useMemo(() => {
    const roots = sprintTasks.filter(
      (task) => (task.parentId ?? null) === null && task.status === "Done",
    );
    return treesForRoots(sprintTasks, roots);
  }, [sprintTasks]);

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

  const moveKind = useCallback(
    async (taskId: number, kind: TaskKind) => {
      const updated = await moveTaskKindRepo(taskId, kind);
      await loadAll();
      return updated;
    },
    [loadAll],
  );

  const reorderTasks = useCallback(
    async (parentId: number | null, orderedIds: number[]) => {
      await reorderTasksRepo(parentId, orderedIds);
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
    reload: loadAll,
  };
}
