import { getDB } from "../db";
import { getUniqueStringValues } from "../lib/uniqueValues";
import { logActivity } from "../lib/activityLog";
import { deleteLeadWithLogs } from "../lib/cascade";
import type { Lead } from "../types";

export async function getAllLeads(): Promise<Lead[]> {
  const database = getDB();
  return database.leads.orderBy("createdAt").reverse().toArray();
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const database = getDB();
  return database.leads.get(id);
}

export async function getLeadsByCompanyId(companyId: number): Promise<Lead[]> {
  const database = getDB();
  return database.leads
    .where("companyId")
    .equals(companyId)
    .reverse()
    .sortBy("createdAt");
}

export async function createLead(
  data: Omit<Lead, "id" | "createdAt">,
): Promise<number> {
  const database = getDB();
  const id = await database.leads.add({
    ...data,
    createdAt: Date.now(),
  });
  await logActivity("lead", id as number, "Lead Added");
  return id as number;
}

export async function updateLead(
  id: number,
  data: Partial<Omit<Lead, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();
  await database.leads.update(id, data);
  await logActivity("lead", id, "Lead Updated");
}

export async function deleteLead(id: number): Promise<void> {
  await deleteLeadWithLogs(id);
}

export async function getRecentLeads(limit = 5): Promise<Lead[]> {
  const database = getDB();
  return database.leads.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function countLeadsSince(since: number | null): Promise<number> {
  const database = getDB();
  if (since === null) return database.leads.count();
  return database.leads.where("createdAt").aboveOrEqual(since).count();
}

export async function getTodayFollowUpLeads(today: string): Promise<Lead[]> {
  const database = getDB();
  const all = await database.leads.toArray();
  return all.filter(
    (l: Lead) =>
      l.firstFollowUpDate === today || l.secondFollowUpDate === today,
  );
}

export async function searchLeads(query: string): Promise<Lead[]> {
  const database = getDB();
  const lower = query.toLowerCase();
  const all = await database.leads.toArray();
  return all.filter((l: Lead) => l.name.toLowerCase().includes(lower));
}

export async function getUniqueLeadRoles(): Promise<string[]> {
  const database = getDB();
  const leads = await database.leads.toArray();
  return getUniqueStringValues(leads.map((lead) => lead.role));
}

export async function getUniqueLeadTypes(): Promise<string[]> {
  const database = getDB();
  const leads = await database.leads.toArray();
  return getUniqueStringValues(leads.map((lead) => lead.type));
}
