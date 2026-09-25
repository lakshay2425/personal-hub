import { getTodayDateString } from "@/features/logger/lib/dateUtils";
import { createLogEntry } from "@/features/logger/lib/loggerRepository";
import { getDB } from "@/features/questions/lib/db";

import {
  deleteActivityLogsForTask,
  deleteAllTaskActivityLogs,
  logTaskActivity,
} from "./activityLog";
import { canToggleTaskCompletion, compareTasks } from "./taskTree";
import type {
  CreateSubTaskInput,
  CreateTaskInput,
  Task,
  TaskKind,
  UpdateTaskInput,
} from "../types";

async function collectDescendantIdsFromDb(parentId: number): Promise<number[]> {
  const db = getDB();
  const children = await db.tasks.where("parentId").equals(parentId).toArray();
  const ids: number[] = [];

  for (const child of children) {
    ids.push(child.id!);
    ids.push(...(await collectDescendantIdsFromDb(child.id!)));
  }

  return ids;
}

async function getNextSortOrder(
  parentId: number | null,
  kind: TaskKind,
): Promise<number> {
  const db = getDB();
  const siblings = await db.tasks
    .filter(
      (task) =>
        (task.parentId ?? null) === parentId && task.kind === kind,
    )
    .toArray();

  if (siblings.length === 0) {
    return 0;
  }

  return Math.max(...siblings.map((task) => task.sortOrder ?? 0)) + 1;
}

export async function getAllTasks(): Promise<Task[]> {
  const db = getDB();
  const tasks = await db.tasks.toArray();
  return tasks.sort(compareTasks);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = getDB();
  const now = Date.now();
  const sortOrder = await getNextSortOrder(null, "inbox");

  const task: Task = {
    kind: "inbox",
    parentId: null,
    depth: 0,
    sortOrder,
    title: input.title.trim(),
    status: "Todo",
    completedAt: null,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
  };

  const id = await db.tasks.add(task);
  await logTaskActivity(id as number, "Task Created");

  return { ...task, id: id as number };
}

export async function createSubTask(
  parentId: number,
  input: CreateSubTaskInput,
): Promise<Task> {
  const db = getDB();
  const parent = await db.tasks.get(parentId);

  if (!parent) {
    throw new Error("Parent task not found");
  }

  if (parent.kind === "inbox") {
    throw new Error("Move this task to Sprint or Iterative before adding sub-tasks");
  }

  if (parent.depth >= 2) {
    throw new Error("Maximum sub-task depth reached");
  }

  const now = Date.now();
  const depth = (parent.depth + 1) as Task["depth"];
  const sortOrder = await getNextSortOrder(parentId, parent.kind);

  const task: Task = {
    kind: parent.kind,
    parentId,
    depth,
    sortOrder,
    title: input.title.trim(),
    status: "Todo",
    completedAt: null,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
  };

  const id = await db.tasks.add(task);
  await logTaskActivity(id as number, "Sub-task Created");

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
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
  };

  await db.tasks.put(updated);
  return updated;
}

export async function getSubTaskProgress(
  parentId: number,
): Promise<{ done: number; total: number }> {
  const db = getDB();
  const descendantIds = await collectDescendantIdsFromDb(parentId);
  const descendants = await db.tasks.bulkGet(descendantIds);

  const validDescendants = descendants.filter(
    (task): task is Task => task !== undefined,
  );

  return {
    done: validDescendants.filter((task) => task.status === "Done").length,
    total: validDescendants.length,
  };
}

async function hasDirectChildren(taskId: number): Promise<boolean> {
  const db = getDB();
  const child = await db.tasks.where("parentId").equals(taskId).first();
  return child !== undefined;
}

export async function maybeUpdateParentCompletion(
  parentId: number,
): Promise<void> {
  const db = getDB();
  const parent = await db.tasks.get(parentId);

  if (!parent || parent.kind === "recursive") {
    return;
  }

  const children = await db.tasks.where("parentId").equals(parentId).toArray();

  if (children.length === 0) {
    return;
  }

  const allDone = children.every((child) => child.status === "Done");

  if (allDone && parent.status !== "Done") {
    await db.tasks.put({
      ...parent,
      status: "Done",
      completedAt: Date.now(),
    });
    if (parent.parentId !== null) {
      await maybeUpdateParentCompletion(parent.parentId);
    }
    return;
  }

  if (!allDone && parent.status === "Done") {
    await db.tasks.put({
      ...parent,
      status: "Todo",
      completedAt: null,
    });
    if (parent.parentId !== null) {
      await maybeUpdateParentCompletion(parent.parentId);
    }
  }
}

export async function toggleTaskComplete(
  task: Task,
  markDone: boolean,
): Promise<Task> {
  const db = getDB();
  const id = task.id!;
  const hasChildren = await hasDirectChildren(id);

  if (!canToggleTaskCompletion(task, hasChildren)) {
    throw new Error(
      hasChildren
        ? "Cannot toggle completion on a task with sub-tasks"
        : "Add a slice under this practice before marking work done",
    );
  }

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
      {
        source: "planner",
      },
    );
    await logTaskActivity(id, "Task Completed");

    if (task.parentId !== null) {
      await maybeUpdateParentCompletion(task.parentId);
    }

    return updated;
  }

  const updated: Task = {
    ...task,
    status: "Todo",
    completedAt: null,
  };
  await db.tasks.put(updated);

  if (task.parentId !== null) {
    await maybeUpdateParentCompletion(task.parentId);
  }

  return updated;
}

export async function moveTaskKind(
  taskId: number,
  kind: TaskKind,
): Promise<Task> {
  const db = getDB();
  const existing = await db.tasks.get(taskId);

  if (!existing) {
    throw new Error("Task not found");
  }

  if ((existing.parentId ?? null) !== null) {
    throw new Error("Only root tasks can be moved between lists");
  }

  const descendantIds = await collectDescendantIdsFromDb(taskId);
  const sortOrder = await getNextSortOrder(null, kind);
  const updated: Task = { ...existing, kind, sortOrder };
  await db.tasks.put(updated);

  for (const descendantId of descendantIds) {
    const descendant = await db.tasks.get(descendantId);
    if (descendant) {
      await db.tasks.put({ ...descendant, kind });
    }
  }

  await logTaskActivity(taskId, "Task Classed");
  return updated;
}

export async function reorderTasks(
  parentId: number | null,
  orderedIds: number[],
): Promise<void> {
  const db = getDB();

  await Promise.all(
    orderedIds.map(async (id, index) => {
      const task = await db.tasks.get(id);
      if (!task || (task.parentId ?? null) !== parentId) {
        throw new Error("Invalid reorder: tasks must be siblings");
      }
      await db.tasks.update(id, { sortOrder: index });
    }),
  );
}

export async function deleteTask(taskId: number): Promise<void> {
  const db = getDB();
  const descendantIds = await collectDescendantIdsFromDb(taskId);
  const idsToDelete = [taskId, ...descendantIds];

  for (const id of idsToDelete) {
    await logTaskActivity(id, "Task Deleted");
    await deleteActivityLogsForTask(id);
  }

  await db.tasks.bulkDelete(idsToDelete);
}

export async function clearAllTasks(): Promise<void> {
  const db = getDB();
  await db.tasks.clear();
  await deleteAllTaskActivityLogs();
}
