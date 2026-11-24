import { getDB } from "../db";
import { deleteAchievementWithLogs } from "../lib/cascade";
import { logActivity } from "../lib/activityLog";
import type { Achievement } from "../types";

export type AchievementInput = Omit<Achievement, "id" | "createdAt" | "updatedAt">;

export async function getAllAchievements(): Promise<Achievement[]> {
  return getDB().achievements.orderBy("createdAt").reverse().toArray();
}

export async function createAchievement(data: AchievementInput): Promise<number> {
  const database = getDB();
  const now = Date.now();
  const id = await database.achievements.add({
    title: data.title.trim(),
    conciseVersion: data.conciseVersion.trim(),
    detailedVersion: data.detailedVersion.trim(),
    createdAt: now,
    updatedAt: now,
  });
  await logActivity("achievement", id as number, "Achievement Created");
  return id as number;
}

export async function updateAchievement(id: number, data: AchievementInput): Promise<void> {
  await getDB().achievements.update(id, {
    title: data.title.trim(),
    conciseVersion: data.conciseVersion.trim(),
    detailedVersion: data.detailedVersion.trim(),
    updatedAt: Date.now(),
  });
  await logActivity("achievement", id, "Achievement Updated");
}

export async function deleteAchievement(id: number): Promise<void> {
  await deleteAchievementWithLogs(id);
}
