import { getDB } from "@/features/questions/lib/db";

import type { ProjectVersion } from "../types";

export async function getVersionsByProjectId(
  projectId: string,
): Promise<ProjectVersion[]> {
  const db = getDB();
  const versions = await db.versions
    .where("projectId")
    .equals(projectId)
    .toArray();
  return versions.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createVersion(
  projectId: string,
  name: string,
): Promise<ProjectVersion> {
  const db = getDB();
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error("Version name is required");
  }

  const existing = await db.versions
    .where("projectId")
    .equals(projectId)
    .filter((version) => version.name.toLowerCase() === trimmed.toLowerCase())
    .first();

  if (existing) {
    return existing;
  }

  const version: ProjectVersion = {
    projectId,
    name: trimmed,
    createdAt: Date.now(),
  };

  const id = await db.versions.add(version);
  return { ...version, id: id as number };
}

export async function deleteVersionsByProjectId(
  projectId: string,
): Promise<void> {
  const db = getDB();
  await db.versions.where("projectId").equals(projectId).delete();
}
