import { DEFAULT_LEAD_CHANNEL } from "../constants";
import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteLeadWithLogs } from "../lib/cascade";
import { getUniqueStringValues } from "../lib/uniqueValues";
import { ensureListOption } from "./listSettingsRepository";
import type { Lead } from "../types";

export type LeadInput = Omit<Lead, "id" | "createdAt">;

export interface LeadDuplicate {
  candidateIndex: number;
  field: "name" | "email" | "linkedin" | "xProfile";
  existingName: string;
  isBlocking: boolean;
}

export class DuplicateLeadError extends Error {
  constructor(public readonly duplicates: LeadDuplicate[]) {
    super("One or more leads duplicate an existing contact");
    this.name = "DuplicateLeadError";
  }
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function normalizeProfile(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return `${url.hostname.toLocaleLowerCase()}${url.pathname}`
      .replace(/\/+$/, "")
      .toLocaleLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, "").toLocaleLowerCase();
  }
}

export function findLeadDuplicates(
  candidates: LeadInput[],
  existingLeads: Lead[],
): LeadDuplicate[] {
  const duplicates: LeadDuplicate[] = [];

  candidates.forEach((candidate, candidateIndex) => {
    const comparableLeads = [
      ...existingLeads.filter((lead) => lead.companyId === candidate.companyId),
      ...candidates
        .slice(0, candidateIndex)
        .filter((lead) => lead.companyId === candidate.companyId),
    ];

    for (const existing of comparableLeads) {
      const duplicateFields: LeadDuplicate["field"][] = [];
      if (
        candidate.email.trim() &&
        normalizeEmail(candidate.email) === normalizeEmail(existing.email ?? "")
      ) {
        duplicateFields.push("email");
      }
      if (
        candidate.linkedin.trim() &&
        normalizeProfile(candidate.linkedin) ===
          normalizeProfile(existing.linkedin ?? "")
      ) {
        duplicateFields.push("linkedin");
      }
      if (
        candidate.xProfile.trim() &&
        normalizeProfile(candidate.xProfile) ===
          normalizeProfile(existing.xProfile ?? "")
      ) {
        duplicateFields.push("xProfile");
      }
      if (
        normalizeName(candidate.name) &&
        normalizeName(candidate.name) === normalizeName(existing.name)
      ) {
        duplicateFields.push("name");
      }

      for (const field of duplicateFields) {
        duplicates.push({
          candidateIndex,
          field,
          existingName: existing.name,
          isBlocking: field !== "name",
        });
      }
    }
  });

  return duplicates;
}

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
  data: LeadInput,
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
    createdAt: Date.now(),
  });
  await logActivity("lead", id as number, "Lead Added");
  return id as number;
}

export async function createLeads(
  data: LeadInput[],
  options: { allowNameDuplicates?: boolean } = {},
): Promise<number[]> {
  if (data.length === 0) {
    throw new Error("At least one lead is required");
  }

  const database = getDB();
  const normalized = data.map((lead) => ({
    ...lead,
    name: lead.name.trim(),
    role: lead.role.trim(),
    email: lead.email.trim(),
    linkedin: lead.linkedin.trim(),
    xProfile: lead.xProfile.trim(),
    notes: lead.notes.trim(),
    status: lead.status.trim(),
  }));
  const statuses = [...new Set(normalized.map((lead) => lead.status))];
  await Promise.all(statuses.map((status) => ensureListOption("leadStatuses", status)));

  return database.transaction(
    "rw",
    database.leads,
    database.activityLogs,
    async () => {
      const existingLeads = await database.leads.toArray();
      const duplicates = findLeadDuplicates(normalized, existingLeads);
      const blockingDuplicates = duplicates.filter(
        (duplicate) =>
          duplicate.isBlocking ||
          (!options.allowNameDuplicates && duplicate.field === "name"),
      );
      if (blockingDuplicates.length > 0) {
        throw new DuplicateLeadError(blockingDuplicates);
      }

      const ids: number[] = [];
      for (const lead of normalized) {
        const now = Date.now();
        const id = await database.leads.add({
          ...lead,
          channel: lead.channel ?? DEFAULT_LEAD_CHANNEL,
          createdAt: now,
        });
        await logActivity("lead", id as number, "Lead Added");
        ids.push(id as number);
      }
      return ids;
    },
  );
}

export async function updateLead(
  id: number,
  data: Partial<Omit<Lead, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();

  if (data.status !== undefined) {
    await ensureListOption("leadStatuses", data.status);
  }

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
