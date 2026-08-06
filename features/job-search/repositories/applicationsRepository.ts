import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteApplicationWithLogs } from "../lib/cascade";
import type { Application, ApplicationStatus } from "../types";

export async function getAllApplications(): Promise<Application[]> {
  const database = getDB();
  return database.applications.orderBy("createdAt").reverse().toArray();
}

export async function getApplicationById(
  id: number,
): Promise<Application | undefined> {
  const database = getDB();
  return database.applications.get(id);
}

export async function getApplicationsByCompanyId(
  companyId: number,
): Promise<Application[]> {
  const database = getDB();
  return database.applications
    .where("companyId")
    .equals(companyId)
    .reverse()
    .sortBy("createdAt");
}

export async function createApplication(
  data: Omit<Application, "id" | "createdAt">,
): Promise<number> {
  const database = getDB();
  const id = await database.applications.add({
    ...data,
    createdAt: Date.now(),
  });
  await logActivity("application", id as number, "Application Created");
  return id as number;
}

export async function updateApplication(
  id: number,
  data: Partial<Omit<Application, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();
  const existing = await database.applications.get(id);
  await database.applications.update(id, data);

  if (data.status && existing && data.status !== existing.status) {
    await logActivity(
      "application",
      id,
      `Application Status Changed to ${data.status}`,
    );
  } else {
    await logActivity("application", id, "Application Updated");
  }
}

export async function deleteApplication(id: number): Promise<void> {
  await deleteApplicationWithLogs(id);
}

export async function getRecentApplications(
  limit = 5,
): Promise<Application[]> {
  const database = getDB();
  return database.applications
    .orderBy("createdAt")
    .reverse()
    .limit(limit)
    .toArray();
}

export async function countApplicationsSince(
  since: number | null,
): Promise<number> {
  const database = getDB();
  if (since === null) return database.applications.count();
  return database.applications
    .where("createdAt")
    .aboveOrEqual(since)
    .count();
}

export async function countApplicationsByStatusSince(
  status: ApplicationStatus,
  since: number | null,
): Promise<number> {
  const database = getDB();
  const all = await database.applications.toArray();
  return all.filter((a: Application) => {
    if (a.status !== status) return false;
    if (since === null) return true;
    return a.createdAt >= since;
  }).length;
}

export async function searchApplications(
  query: string,
): Promise<Application[]> {
  const database = getDB();
  const lower = query.toLowerCase();
  const all = await database.applications.toArray();
  return all.filter((a: Application) => a.role.toLowerCase().includes(lower));
}
