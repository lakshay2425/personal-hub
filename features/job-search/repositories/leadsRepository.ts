import { DEFAULT_LEAD_CHANNEL } from "../constants";
import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteLeadWithLogs } from "../lib/cascade";
import { getUniqueStringValues } from "../lib/uniqueValues";
import { ensureListOption } from "./listSettingsRepository";
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
  const channel = data.channel ?? DEFAULT_LEAD_CHANNEL;
  const status = data.status.trim();

  await ensureListOption("leadStatuses", status);

  const id = await database.leads.add({
    ...data,
    channel,
    linkedin: data.linkedin ?? "",
    xProfile: data.xProfile ?? "",
    firstFollowUpDate: data.firstFollowUpDate || null,
    secondFollowUpDate: data.secondFollowUpDate || null,
    followUpTemplateId: data.followUpTemplateId ?? null,
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

  if (data.status !== undefined) {
    await ensureListOption("leadStatuses", data.status);
  }

  const normalized: Partial<Omit<Lead, "id" | "createdAt">> = { ...data };
  if (data.firstFollowUpDate !== undefined) {
    normalized.firstFollowUpDate = data.firstFollowUpDate || null;
  }
  if (data.secondFollowUpDate !== undefined) {
    normalized.secondFollowUpDate = data.secondFollowUpDate || null;
  }

  await database.leads.update(id, normalized);
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
    (lead: Lead) =>
      lead.firstFollowUpDate === today || lead.secondFollowUpDate === today,
  );
}

export async function searchLeads(query: string): Promise<Lead[]> {
  const database = getDB();
  const lower = query.toLowerCase();
  const all = await database.leads.toArray();
  return all.filter((lead: Lead) => lead.name.toLowerCase().includes(lower));
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
