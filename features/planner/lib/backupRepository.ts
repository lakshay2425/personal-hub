import type { QuestionHubActivityLog } from "@/features/content-ideas/types";
import { getDB } from "@/features/questions/lib/db";
import type { PrioritiesSettings } from "@/features/settings/types";
import { assertBackupShape } from "@/lib/export/validateBackup";

import type { Task } from "../types";

type LegacyTask = Task & {
  kind?: Task["kind"];
  weekStart?: string;
  priority?: "High" | "Medium" | "Low" | null;
  category?: string;
};

export type PlannerBackupPayload = {
  version: 1;
  tasks: Task[];
  activityLogs: QuestionHubActivityLog[];
  settings: PrioritiesSettings[];
};

function backfillTaskFields(task: LegacyTask, allTasks: LegacyTask[]): Task {
  const parentId = task.parentId ?? null;
  const parent = parentId === null ? undefined : allTasks.find((item) => item.id === parentId);
  const depth =
    task.depth ??
    (parentId === null ? 0 : (((parent?.depth ?? 0) + 1) as Task["depth"]));

  return {
    id: task.id,
    kind: task.kind ?? "inbox",
    parentId,
    depth,
    sortOrder: task.sortOrder ?? 0,
    title: task.title,
    status: task.status,
    completedAt: task.completedAt,
    notes: task.notes,
    createdAt: task.createdAt,
  };
}

function assignTaskSortOrders(tasks: Task[]): Task[] {
  const byGroup = new Map<string, Task[]>();

  for (const task of tasks) {
    const key = `${task.kind}\0${task.parentId ?? "root"}`;
    const group = byGroup.get(key) ?? [];
    group.push(task);
    byGroup.set(key, group);
  }

  const sortOrderById = new Map<number, number>();

  for (const group of byGroup.values()) {
    group.sort((a, b) => a.createdAt - b.createdAt);
    group.forEach((task, index) => {
      if (task.id !== undefined) {
        sortOrderById.set(task.id, index);
      }
    });
  }

  return tasks.map((task) => ({
    ...task,
    sortOrder:
      task.sortOrder ??
      (task.id !== undefined ? sortOrderById.get(task.id) ?? 0 : 0),
  }));
}

function isTaskActivityLog(log: QuestionHubActivityLog): boolean {
  return log.entityType === "task";
}

function isPrioritiesSettings(
  settings: PrioritiesSettings,
): settings is PrioritiesSettings {
  return settings.key === "priorities" && Array.isArray(settings.slots);
}

export async function exportPlannerData() {
  const db = getDB();
  const [tasks, activityLogs, settings] = await Promise.all([
    db.tasks.toArray(),
    db.activityLogs.where("entityType").equals("task").toArray(),
    db.settings.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    activityLogs,
    settings: settings.filter(isPrioritiesSettings),
  };
}

export function validatePlannerBackup(data: unknown): PlannerBackupPayload {
  const arrays = assertBackupShape(data, ["tasks"]);
  const record = data as Record<string, unknown>;

  return {
    version: 1,
    tasks: assignTaskSortOrders(
      (arrays.tasks as LegacyTask[]).map((task, _index, tasks) =>
        backfillTaskFields(task, tasks),
      ),
    ),
    activityLogs: Array.isArray(record.activityLogs)
      ? (record.activityLogs as QuestionHubActivityLog[]).filter(isTaskActivityLog)
      : [],
    settings: Array.isArray(record.settings)
      ? (record.settings as PrioritiesSettings[]).filter(isPrioritiesSettings)
      : [],
  };
}

export async function importPlannerData(
  payload: PlannerBackupPayload,
): Promise<void> {
  const db = getDB();

  await db.transaction(
    "rw",
    [db.tasks, db.activityLogs, db.settings],
    async () => {
      await Promise.all([
        db.tasks.clear(),
        db.activityLogs.where("entityType").equals("task").delete(),
        db.settings.delete("priorities"),
      ]);

      await Promise.all([
        db.tasks.bulkPut(payload.tasks),
        db.activityLogs.bulkPut(payload.activityLogs),
        db.settings.bulkPut(payload.settings),
      ]);
    },
  );
}
