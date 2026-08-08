import { getDB } from "@/features/questions/lib/db";

export async function logFeatureActivity(
  entityId: number,
  action: string,
): Promise<void> {
  const db = getDB();
  await db.activityLogs.add({
    entityType: "feature",
    entityId,
    action,
    timestamp: Date.now(),
  });
}
