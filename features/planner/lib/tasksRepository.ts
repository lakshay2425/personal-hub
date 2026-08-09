import { getTodayDateString } from "@/features/logger/lib/dateUtils";
import { createLogEntry } from "@/features/logger/lib/loggerRepository";
import { getDB } from "@/features/questions/lib/db";

import {
  deleteActivityLogsForTask,
  logTaskActivity,
} from "./activityLog";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types";

export async function getTasksForWeek(weekStart: string): Promise<Task[]> {
  const db = getDB();
  return db.tasks.where("weekStart").equals(weekStart).toArray();
}

export async function getBacklogTasks(
  currentWeekStart: string,
): Promise<Task[]> {
  const db = getDB();
  const tasks = await db.tasks
    .where("status")
    .equals("Todo")
    .filter((task) => task.weekStart < currentWeekStart)
    .toArray();
  return tasks;
}

export async function getUpcomingTasks(
  currentWeekStart: string,
): Promise<Task[]> {
  const db = getDB();
  return db.tasks
    .filter((task) => task.weekStart > currentWeekStart)
    .toArray();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = getDB();
  const now = Date.now();

  const task: Task = {
    weekStart: input.weekStart,
    title: input.title.trim(),
    priority: input.priority ?? "Medium",
    status: "Todo",
    completedAt: null,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
  };

  const id = await db.tasks.add(task);
  await logTaskActivity(id as number, "Task Created");

  return { ...task, id: id as number };
}

export async function updateTask(
  id: number,
  input: UpdateTaskInput,
): Promise<Task> {
  const db = getDB();
  const existing = await db.tasks.get(id);

  if (!existing) {
    throw new Error("Task not found");
  }

  const updated: Task = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    ...(input.weekStart !== undefined && { weekStart: input.weekStart }),
  };

  await db.tasks.put(updated);
  return updated;
}

export async function toggleTaskComplete(
  task: Task,
  markDone: boolean,
): Promise<Task> {
  const db = getDB();
  const id = task.id!;

  if (markDone) {
    const updated: Task = {
      ...task,
      status: "Done",
      completedAt: Date.now(),
    };
    await db.tasks.put(updated);
    await createLogEntry(
      getTodayDateString(),
      `✓ Completed task: ${task.title}`,
      { source: "planner" },
    );
    await logTaskActivity(id, "Task Completed");
    return updated;
  }

  const updated: Task = {
    ...task,
    status: "Todo",
    completedAt: null,
  };
  await db.tasks.put(updated);
  return updated;
}

export async function moveTaskToWeek(
  taskId: number,
  weekStart: string,
): Promise<Task> {
  const db = getDB();
  const existing = await db.tasks.get(taskId);

  if (!existing) {
    throw new Error("Task not found");
  }

  const updated: Task = { ...existing, weekStart };
  await db.tasks.put(updated);
  await logTaskActivity(taskId, "Task Moved to This Week");
  return updated;
}

export async function deleteTask(taskId: number): Promise<void> {
  const db = getDB();
  await logTaskActivity(taskId, "Task Deleted");
  await deleteActivityLogsForTask(taskId);
  await db.tasks.delete(taskId);
}

export async function getAllTasks(): Promise<Task[]> {
  const db = getDB();
  return db.tasks.toArray();
}
