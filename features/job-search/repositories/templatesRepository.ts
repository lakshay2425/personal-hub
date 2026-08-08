import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteTemplateWithLogs } from "../lib/cascade";
import type { Template } from "../types";

export async function getAllTemplates(): Promise<Template[]> {
  const database = getDB();
  return database.templates.orderBy("createdAt").reverse().toArray();
}

export async function getTemplateById(
  id: number,
): Promise<Template | undefined> {
  const database = getDB();
  return database.templates.get(id);
}

export async function createTemplate(
  data: Omit<Template, "id" | "createdAt" | "updatedAt">,
): Promise<number> {
  const database = getDB();
  const now = Date.now();
  const id = await database.templates.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  await logActivity("template", id as number, "Template Created");
  return id as number;
}

export async function updateTemplate(
  id: number,
  data: Partial<Omit<Template, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();
  await database.templates.update(id, {
    ...data,
    updatedAt: Date.now(),
  });
  await logActivity("template", id, "Template Updated");
}

export async function deleteTemplate(id: number): Promise<void> {
  await deleteTemplateWithLogs(id);
}
