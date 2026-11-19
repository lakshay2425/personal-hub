import type { Lead, LeadTouchpoint } from "../types";

export interface ScheduledFollowUp {
  leadId: number;
  date: string;
  channel: Lead["channel"];
  touchpointId: number;
}

const FOLLOW_UP_TYPES = new Set(["Follow-up", "First Follow-up", "Second Follow-up"]);
const REPLY_TYPES = new Set(["Reply"]);

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isReplied(touchpoint: LeadTouchpoint): boolean {
  return [touchpoint.status, touchpoint.responseStatus].some((status) =>
    ["Replied", "Positive Response"].includes(status),
  );
}

export function isCompletedFollowUpTouchpoint(touchpoint: LeadTouchpoint): boolean {
  return isReplied(touchpoint) || (touchpoint.status === "Sent" && (FOLLOW_UP_TYPES.has(touchpoint.type) || REPLY_TYPES.has(touchpoint.type)));
}

export function isInitialSentMessage(touchpoint: LeadTouchpoint): boolean {
  if (touchpoint.status !== "Sent" || !["Email", "LinkedIn", "X"].includes(touchpoint.channel)) return false;
  if (touchpoint.type === "Initial") return true;
  return touchpoint.type === "Message" || (touchpoint.channel === "LinkedIn" && touchpoint.type === "Message Draft");
}

export function getFirstFollowUpDate(occurredAt: number, delayDays: number): string {
  const date = new Date(occurredAt);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + delayDays);
  return dateKey(date);
}

export function resolveFollowUpDelayDays(lead: Lead, defaultDelayDays: number): number {
  const override = lead.followUpDelayDays;
  return Number.isInteger(override) && override! >= 1 && override! <= 365
    ? override!
    : defaultDelayDays;
}

export function isPendingFirstFollowUp(lead: Lead, touchpoints: LeadTouchpoint[]): boolean {
  if (!lead.scheduledFirstFollowUpTouchpointId) return false;
  const initial = touchpoints.find((touchpoint) => touchpoint.id === lead.scheduledFirstFollowUpTouchpointId);
  if (!initial || !isInitialSentMessage(initial) || isReplied(initial)) return false;
  return !touchpoints.some((touchpoint) =>
    touchpoint.occurredAt >= initial.occurredAt &&
    touchpoint.id !== initial.id &&
    isCompletedFollowUpTouchpoint(touchpoint),
  );
}

export function getScheduledFollowUps(
  leads: Lead[],
  touchpoints: LeadTouchpoint[],
): ScheduledFollowUp[] {
  const touchpointsByLead = new Map<number, LeadTouchpoint[]>();
  for (const touchpoint of touchpoints) {
    const entries = touchpointsByLead.get(touchpoint.leadId) ?? [];
    entries.push(touchpoint);
    touchpointsByLead.set(touchpoint.leadId, entries);
  }

  const result: ScheduledFollowUp[] = [];
  for (const lead of leads) {
    if (!lead.id || !lead.scheduledFirstFollowUpDate || !lead.scheduledFirstFollowUpTouchpointId) continue;
    const entries = (touchpointsByLead.get(lead.id) ?? []).sort((a, b) => a.occurredAt - b.occurredAt);
    if (!isPendingFirstFollowUp(lead, entries)) continue;
    const initial = entries.find((touchpoint) => touchpoint.id === lead.scheduledFirstFollowUpTouchpointId)!;

    if (!isValidLocalDateKey(lead.scheduledFirstFollowUpDate)) continue;
    result.push({ leadId: lead.id, date: lead.scheduledFirstFollowUpDate, channel: initial.channel, touchpointId: initial.id! });
  }
  return result;
}

function isValidLocalDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && dateKey(parsed) === value;
}

export function validateOutreachDate(value: string, today = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a valid outreach date.";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || dateKey(parsed) !== value) return "Choose a valid outreach date.";
  if (value < dateKey(today)) return "Outreach cannot be scheduled for a past date.";
  return null;
}

export function validateFollowUpDelayDays(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 365) {
    return "Follow-up delay must be a whole number from 1 to 365 days.";
  }
  return null;
}
