import { getDB } from "../db";
import { getTimeFilterStart, getTodayDateString } from "../lib/dateUtils";
import { getScheduledFollowUps } from "../lib/followUpScheduling";
import { isLeadSnoozed } from "../lib/snoozeUtils";
import type { DashboardCalendarItem, DashboardStats, Lead, LeadTouchpoint, TimeFilter } from "../types";

const LINKEDIN_MESSAGES = ["Message", "Follow-up"];
const EMAIL_NO_REPLY_TYPES = ["Message", "First Follow-up", "Second Follow-up"];
const EMAIL_REPLIED_TYPES = ["Message", "First Follow-up", "Second Follow-up"];

function matchesOutreach(
  touchpoint: LeadTouchpoint,
  channel: "LinkedIn" | "Email",
  types: string[],
  responseStatus: string,
  since: number | null,
) {
  return touchpoint.channel === channel &&
    types.includes(touchpoint.type) &&
    touchpoint.status === "Sent" &&
    touchpoint.responseStatus === responseStatus &&
    (since === null || touchpoint.occurredAt >= since);
}

export function countMatchingLeadsBySnoozeStatus(
  leads: Lead[],
  touchpoints: LeadTouchpoint[],
  predicate: (touchpoint: LeadTouchpoint) => boolean,
  today = getTodayDateString(),
): { notSnoozed: number; snoozed: number } {
  const leadsById = new Map(
    leads
      .filter((lead): lead is Lead & { id: number } => lead.id !== undefined)
      .map((lead) => [lead.id, lead]),
  );
  const matchingLeadIds = new Set(
    touchpoints.filter(predicate).map((touchpoint) => touchpoint.leadId),
  );
  let notSnoozed = 0;
  let snoozed = 0;

  for (const leadId of matchingLeadIds) {
    if (isLeadSnoozed(leadsById.get(leadId) ?? {}, today)) snoozed += 1;
    else notSnoozed += 1;
  }

  return { notSnoozed, snoozed };
}

export function getTouchpointDashboardMetrics(
  touchpoints: LeadTouchpoint[],
  since: number | null,
): Pick<
  DashboardStats,
  | "totalTouchpoints"
  | "linkedinTouchpoints"
  | "xTouchpoints"
  | "emailTouchpoints"
  | "linkedinMessageDrafts"
  | "emailDrafts"
> {
  const inRange = (touchpoint: LeadTouchpoint) =>
    since === null || touchpoint.occurredAt >= since;
  const filtered = touchpoints.filter(inRange);
  const count = (predicate: (touchpoint: LeadTouchpoint) => boolean) =>
    filtered.filter(predicate).length;

  return {
    totalTouchpoints: filtered.length,
    linkedinTouchpoints: count((touchpoint) => touchpoint.channel === "LinkedIn"),
    xTouchpoints: count((touchpoint) => touchpoint.channel === "X"),
    emailTouchpoints: count((touchpoint) => touchpoint.channel === "Email"),
    linkedinMessageDrafts: count(
      (touchpoint) =>
        touchpoint.channel === "LinkedIn" &&
        touchpoint.status === "Draft" &&
        touchpoint.type === "Message Draft",
    ),
    emailDrafts: count(
      (touchpoint) =>
        touchpoint.channel === "Email" && touchpoint.status === "Draft",
    ),
  };
}

export function getApplicationDashboardMetrics(
  applications: Array<{ status: string; createdAt: number }>,
  since: number | null,
): Pick<
  DashboardStats,
  "applicationsApplied" | "interviews" | "applicationsRejected" | "offers"
> {
  const inRange = (application: { createdAt: number }) =>
    since === null || application.createdAt >= since;
  const count = (status: string) =>
    applications.filter(
      (application) => application.status === status && inRange(application),
    ).length;

  return {
    applicationsApplied: count("Applied"),
    interviews: count("Interview"),
    applicationsRejected: count("Rejected"),
    offers: count("Offer"),
  };
}

export async function getDashboardStats(filter: TimeFilter): Promise<DashboardStats> {
  const since = getTimeFilterStart(filter);
  const database = getDB();
  const [touchpoints, applications, leads] = await Promise.all([
    database.leadTouchpoints.toArray(),
    database.applications.toArray(),
    database.leads.toArray(),
  ]);
  const countMatchingLeads = (predicate: (touchpoint: LeadTouchpoint) => boolean) => {
    const matchingLeadIds = new Set(
      touchpoints.filter(predicate).map((touchpoint) => touchpoint.leadId),
    );
    return matchingLeadIds.size;
  };
  const touchpointMetrics = getTouchpointDashboardMetrics(touchpoints, since);
  const connectionRequestsNotAccepted = countMatchingLeadsBySnoozeStatus(
    leads,
    touchpoints,
    (touchpoint) =>
      matchesOutreach(
        touchpoint,
        "LinkedIn",
        ["Connection Request"],
        "Not accepted",
        since,
      ),
  );
  const connectionRequestsAccepted = countMatchingLeadsBySnoozeStatus(
    leads,
    touchpoints,
    (touchpoint) =>
      matchesOutreach(
        touchpoint,
        "LinkedIn",
        ["Connection Request"],
        "Accepted",
        since,
      ),
  );
  const applicationMetrics = getApplicationDashboardMetrics(applications, since);

  return {
    ...touchpointMetrics,
    linkedinConnectionNotAccepted: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "LinkedIn", ["Connection Request"], "Not accepted", since)),
    linkedinConnectionNotAcceptedNotSnoozed: connectionRequestsNotAccepted.notSnoozed,
    linkedinConnectionNotAcceptedSnoozed: connectionRequestsNotAccepted.snoozed,
    linkedinMessagesNoReply: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "LinkedIn", LINKEDIN_MESSAGES, "Not responded", since)),
    linkedinMessagesReplied: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "LinkedIn", LINKEDIN_MESSAGES, "Replied", since)),
    linkedinConnectionAccepted: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "LinkedIn", ["Connection Request"], "Accepted", since)),
    linkedinConnectionAcceptedNotSnoozed: connectionRequestsAccepted.notSnoozed,
    linkedinConnectionAcceptedSnoozed: connectionRequestsAccepted.snoozed,
    emailNoReply: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "Email", EMAIL_NO_REPLY_TYPES, "Not responded", since)),
    emailReplied: countMatchingLeads((touchpoint) => matchesOutreach(touchpoint, "Email", EMAIL_REPLIED_TYPES, "Replied", since)),
    ...applicationMetrics,
  };
}

export async function getDashboardCalendarItems(): Promise<DashboardCalendarItem[]> {
  const database = getDB();
  const [leads, touchpoints, companies] = await Promise.all([database.leads.toArray(), database.leadTouchpoints.toArray(), database.companies.toArray()]);
  const companyNames = new Map(companies.map((company) => [company.id!, company.companyName]));
  const items: DashboardCalendarItem[] = [];
  for (const lead of leads) {
    if (!lead.id) continue;
    const companyName = companyNames.get(lead.companyId) ?? "Unknown company";
    if (lead.nextFollowUpDate && ["Email", "LinkedIn", "X"].includes(lead.channel)) {
      items.push({ id: lead.id, name: lead.name, companyName, channel: lead.channel, kind: "newConversation", href: `/job-search/leads?leadId=${lead.id}`, date: lead.nextFollowUpDate });
    }
  }
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
  for (const scheduled of getScheduledFollowUps(leads, touchpoints)) {
    const lead = leadsById.get(scheduled.leadId);
    if (!lead?.id) continue;
    items.push({ id: lead.id, name: lead.name, companyName: companyNames.get(lead.companyId) ?? "Unknown company", channel: scheduled.channel, kind: "followUp", href: `/job-search/leads?leadId=${lead.id}`, date: scheduled.date });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? 0 : a.kind === "followUp" ? -1 : 1));
}
