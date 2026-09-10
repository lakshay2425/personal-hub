import {
  DEFAULT_TOUCHPOINT_STATUS,
  isLeadChannel,
  LEGACY_LEAD_CHANNEL,
} from "../constants";
import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { isTimestampInWeek } from "../lib/dateUtils";
import {
  ensureListOption,
  getListSettings,
} from "./listSettingsRepository";
import type {
  Lead,
  LeadChannel,
  LeadTouchpoint,
  LeadWithTouchpoints,
} from "../types";

export type LeadTouchpointInput = Omit<
  LeadTouchpoint,
  "id" | "leadId" | "createdAt"
>;

function normalizeChannel(channel: LeadChannel): LeadChannel {
  return isLeadChannel(channel) ? channel : LEGACY_LEAD_CHANNEL;
}

function groupLeadsWithTouchpoints(
  leads: Lead[],
  touchpoints: LeadTouchpoint[],
): LeadWithTouchpoints[] {
  const byLeadId = new Map<number, LeadTouchpoint[]>();

  for (const touchpoint of touchpoints) {
    const list = byLeadId.get(touchpoint.leadId) ?? [];
    list.push(touchpoint);
    byLeadId.set(touchpoint.leadId, list);
  }

  const grouped: LeadWithTouchpoints[] = leads
    .filter((lead): lead is Lead & { id: number } => Boolean(lead.id))
    .map((lead) => ({
      ...lead,
      id: lead.id,
      touchpoints: (byLeadId.get(lead.id) ?? []).sort(
        (a, b) => b.occurredAt - a.occurredAt,
      ),
    }));

  grouped.sort((a, b) => {
    const aLatest = a.touchpoints[0]?.occurredAt ?? a.createdAt;
    const bLatest = b.touchpoints[0]?.occurredAt ?? b.createdAt;
    return bLatest - aLatest;
  });

  return grouped;
}

async function evaluateLeadStatus(leadId: number): Promise<void> {
  const database = getDB();
  const [settings, touchpoints] = await Promise.all([
    getListSettings(),
    database.leadTouchpoints.where("leadId").equals(leadId).toArray(),
  ]);

  const hasContactedTrigger = touchpoints.some((touchpoint) =>
    settings.contactedTriggerStatuses.includes(touchpoint.status),
  );

  await database.leads.update(leadId, {
    status: hasContactedTrigger
      ? settings.contactedLeadStatus
      : settings.newLeadStatus,
  });
}

export async function getAllLeadsWithTouchpoints(): Promise<
  LeadWithTouchpoints[]
> {
  const database = getDB();
  const [leads, touchpoints] = await Promise.all([
    database.leads.toArray(),
    database.leadTouchpoints.toArray(),
  ]);

  return groupLeadsWithTouchpoints(leads, touchpoints);
}

export async function getTouchpointsByLeadId(
  leadId: number,
): Promise<LeadTouchpoint[]> {
  const database = getDB();
  const touchpoints = await database.leadTouchpoints
    .where("leadId")
    .equals(leadId)
    .toArray();

  return touchpoints.sort((a, b) => b.occurredAt - a.occurredAt);
}

export async function addTouchpoint(
  leadId: number,
  input: LeadTouchpointInput,
): Promise<number> {
  const database = getDB();
  const lead = await database.leads.get(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const channel = normalizeChannel(input.channel);
  const type = input.type.trim() || "Other";
  const status = input.status.trim() || DEFAULT_TOUCHPOINT_STATUS;
  const now = Date.now();

  await Promise.all([
    ensureListOption("touchpointTypes", type),
    ensureListOption("touchpointStatuses", status),
  ]);

  const id = await database.leadTouchpoints.add({
    leadId,
    channel,
    type,
    status,
    templateId: input.templateId ?? null,
    context: input.context.trim(),
    occurredAt: input.occurredAt || now,
    createdAt: now,
  });

  await evaluateLeadStatus(leadId);
  await logActivity("lead", leadId, "Touchpoint Added");
  return id as number;
}

export async function updateTouchpoint(
  id: number,
  partial: Partial<LeadTouchpointInput>,
): Promise<void> {
  const database = getDB();
  const existing = await database.leadTouchpoints.get(id);
  if (!existing) {
    throw new Error("Touchpoint not found");
  }

  const type =
    partial.type !== undefined ? partial.type.trim() || "Other" : existing.type;
  const status =
    partial.status !== undefined
      ? partial.status.trim() || DEFAULT_TOUCHPOINT_STATUS
      : existing.status;

  if (partial.type !== undefined) {
    await ensureListOption("touchpointTypes", type);
  }
  if (partial.status !== undefined) {
    await ensureListOption("touchpointStatuses", status);
  }

  await database.leadTouchpoints.update(id, {
    channel:
      partial.channel !== undefined
        ? normalizeChannel(partial.channel)
        : existing.channel,
    type,
    status,
    templateId:
      partial.templateId !== undefined
        ? partial.templateId
        : existing.templateId,
    context:
      partial.context !== undefined
        ? partial.context.trim()
        : existing.context,
    occurredAt:
      partial.occurredAt !== undefined
        ? partial.occurredAt
        : existing.occurredAt,
  });

  await evaluateLeadStatus(existing.leadId);
  await logActivity("lead", existing.leadId, "Touchpoint Updated");
}

export async function deleteTouchpoint(id: number): Promise<void> {
  const database = getDB();
  const existing = await database.leadTouchpoints.get(id);
  if (!existing) return;

  await database.leadTouchpoints.delete(id);
  await evaluateLeadStatus(existing.leadId);
  await logActivity("lead", existing.leadId, "Touchpoint Deleted");
}

export async function confirmFollowUpSent(
  leadId: number,
  which: 1 | 2,
  payload: Partial<LeadTouchpointInput> = {},
): Promise<number> {
  const database = getDB();
  const lead = await database.leads.get(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const settings = await getListSettings();
  const sentStatus =
    settings.contactedTriggerStatuses.find((status) => status !== "Draft") ??
    "Sent";
  const now = Date.now();

  const touchpointId = await addTouchpoint(leadId, {
    channel: payload.channel ?? lead.channel,
    type: payload.type?.trim() || "Follow-up",
    status: payload.status?.trim() || sentStatus,
    templateId: payload.templateId ?? lead.followUpTemplateId,
    context: payload.context?.trim() ?? "",
    occurredAt: payload.occurredAt ?? now,
  });

  const update: Partial<Lead> =
    which === 1
      ? { firstFollowUpDate: null }
      : { secondFollowUpDate: null };

  await database.leads.update(leadId, update);
  await logActivity("lead", leadId, `Follow-up ${which} Confirmed`);
  return touchpointId;
}

export function matchesLeadTouchpointQuery(
  lead: LeadWithTouchpoints,
  query: string,
): boolean {
  const lower = query.toLowerCase().trim();
  if (!lower) return true;

  if (lead.name.toLowerCase().includes(lower)) return true;
  if (lead.role.toLowerCase().includes(lower)) return true;
  if (lead.type.toLowerCase().includes(lower)) return true;
  if (lead.channel.toLowerCase().includes(lower)) return true;

  return lead.touchpoints.some(
    (touchpoint) =>
      touchpoint.context.toLowerCase().includes(lower) ||
      touchpoint.channel.toLowerCase().includes(lower) ||
      touchpoint.type.toLowerCase().includes(lower) ||
      touchpoint.status.toLowerCase().includes(lower),
  );
}

export function leadHasTouchpointInWeek(
  lead: LeadWithTouchpoints,
  weekStart: string,
): boolean {
  return lead.touchpoints.some((touchpoint) =>
    isTimestampInWeek(touchpoint.occurredAt, weekStart),
  );
}

export async function getRecentTouchpoints(
  limit = 5,
): Promise<(LeadTouchpoint & { lead?: Lead })[]> {
  const database = getDB();
  const touchpoints = await database.leadTouchpoints
    .orderBy("occurredAt")
    .reverse()
    .limit(limit)
    .toArray();

  const leadIds = [...new Set(touchpoints.map((tp) => tp.leadId))];
  const leads = await database.leads.bulkGet(leadIds);
  const leadMap = new Map<number, Lead>();
  for (const lead of leads) {
    if (lead?.id !== undefined) {
      leadMap.set(lead.id, lead);
    }
  }

  return touchpoints.map((touchpoint) => ({
    ...touchpoint,
    lead: leadMap.get(touchpoint.leadId),
  }));
}

export function countTouchpointsInWeek(
  leads: LeadWithTouchpoints[],
  weekStart: string,
): { total: number; linkedIn: number; x: number; email: number } {
  let total = 0;
  let linkedIn = 0;
  let x = 0;
  let email = 0;

  for (const lead of leads) {
    for (const touchpoint of lead.touchpoints) {
      if (!isTimestampInWeek(touchpoint.occurredAt, weekStart)) continue;
      total += 1;
      if (touchpoint.channel === "LinkedIn") linkedIn += 1;
      if (touchpoint.channel === "X") x += 1;
      if (touchpoint.channel === "Email") email += 1;
    }
  }

  return { total, linkedIn, x, email };
}
