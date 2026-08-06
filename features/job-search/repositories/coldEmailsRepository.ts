import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteColdEmailWithLogs } from "../lib/cascade";
import type { ColdEmail } from "../types";

export async function getAllColdEmails(): Promise<ColdEmail[]> {
  const database = getDB();
  return database.coldEmails.orderBy("createdAt").reverse().toArray();
}

export async function getColdEmailById(
  id: number,
): Promise<ColdEmail | undefined> {
  const database = getDB();
  return database.coldEmails.get(id);
}

export async function getColdEmailsByCompanyId(
  companyId: number,
): Promise<ColdEmail[]> {
  const database = getDB();
  return database.coldEmails
    .where("companyId")
    .equals(companyId)
    .reverse()
    .sortBy("createdAt");
}

export async function createColdEmail(
  data: Omit<ColdEmail, "id" | "createdAt">,
): Promise<number> {
  const database = getDB();
  const id = await database.coldEmails.add({
    ...data,
    createdAt: Date.now(),
  });
  await logActivity("coldEmail", id as number, "Cold Email Created");
  return id as number;
}

export async function updateColdEmail(
  id: number,
  data: Partial<Omit<ColdEmail, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();
  const existing = await database.coldEmails.get(id);
  await database.coldEmails.update(id, data);

  if (data.status && existing && data.status !== existing.status) {
    await logActivity(
      "coldEmail",
      id,
      `Cold Email Status Changed to ${data.status}`,
    );
  } else {
    await logActivity("coldEmail", id, "Cold Email Updated");
  }
}

export async function deleteColdEmail(id: number): Promise<void> {
  await deleteColdEmailWithLogs(id);
}

export async function getRecentColdEmails(limit = 5): Promise<ColdEmail[]> {
  const database = getDB();
  return database.coldEmails
    .orderBy("createdAt")
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getTodayFollowUpColdEmails(
  today: string,
): Promise<ColdEmail[]> {
  const database = getDB();
  const all = await database.coldEmails.toArray();
  return all.filter((c: ColdEmail) =>
      c.firstFollowUpDate === today || c.secondFollowUpDate === today,
  );
}

export async function searchColdEmails(query: string): Promise<ColdEmail[]> {
  const database = getDB();
  const lower = query.toLowerCase();
  const all = await database.coldEmails.toArray();
  return all.filter((c: ColdEmail) => c.role.toLowerCase().includes(lower));
}
