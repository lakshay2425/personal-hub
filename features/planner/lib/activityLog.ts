import { getDB } from "@/features/questions/lib/db";

export async function logTaskActivity(
  entityId: number,
  action: string,
): Promise<void> {
  const db = getDB();
  await db.activityLogs.add({
    entityType: "task",
    entityId,
    action,
    timestamp: Date.now(),
  });
}

export async function deleteActivityLogsForTask(
  entityId: number,
): Promise<void> {
  const db = getDB();
  await db.activityLogs
    .where({ entityType: "task", entityId })
    .delete();
}
