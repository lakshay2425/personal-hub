import { getDB } from "@/features/questions/lib/db";

import type { ContentIdeaEntityType } from "../types";

export async function logContentIdeaActivity(
  entityId: number,
  action: string,
): Promise<void> {
  const db = getDB();
  await db.activityLogs.add({
    entityType: "contentIdea",
    entityId,
    action,
    timestamp: Date.now(),
  });
}

export async function deleteActivityLogsForContentIdea(
  entityId: number,
): Promise<void> {
  const db = getDB();
  await db.activityLogs
    .where({ entityType: "contentIdea" as ContentIdeaEntityType, entityId })
    .delete();
}
