import { getDB } from "../db";
import type { EntityType } from "../types";

export async function logActivity(
  entityType: EntityType,
  entityId: number,
  action: string,
): Promise<void> {
  const database = getDB();
  await database.activityLogs.add({
    entityType,
    entityId,
    action,
    timestamp: Date.now(),
  });
}

export async function deleteActivityLogsForEntity(
  entityType: EntityType,
  entityId: number,
): Promise<void> {
  const database = getDB();
  await database.activityLogs
    .where({ entityType, entityId })
    .delete();
}

export async function deleteActivityLogsForEntities(
  entityType: EntityType,
  entityIds: number[],
): Promise<void> {
  if (entityIds.length === 0) return;
  const database = getDB();
  await database.activityLogs
    .where("entityType")
    .equals(entityType)
    .and((log: { entityId: number }) => entityIds.includes(log.entityId))
    .delete();
}
