import { differenceInCalendarDays, startOfDay } from "date-fns";

import { getDB } from "../db";
import { getTimeFilterStart } from "../lib/dateUtils";
import type { DashboardFollowUpItem, DashboardStaleOutreachItem, DashboardStats, Lead, LeadTouchpoint, TimeFilter } from "../types";

function latestTouchpoints(touchpoints: LeadTouchpoint[]) {
  const latest = new Map<number, LeadTouchpoint>();
  for (const touchpoint of touchpoints) {
    const current = latest.get(touchpoint.leadId);
    if (!current || touchpoint.occurredAt > current.occurredAt) latest.set(touchpoint.leadId, touchpoint);
  }
  return latest;
}

function isReplied(touchpoint?: LeadTouchpoint) {
  return Boolean(touchpoint && (["Replied", "Positive Response"].includes(touchpoint.responseStatus) || ["Replied", "Positive Response"].includes(touchpoint.status)));
}

export async function getDashboardStats(filter: TimeFilter): Promise<DashboardStats> {
  const since = getTimeFilterStart(filter);
  const database = getDB();
  const [leads, touchpoints, applications] = await Promise.all([
    database.leads.toArray(), database.leadTouchpoints.toArray(), database.applications.toArray(),
  ]);
  const latest = latestTouchpoints(touchpoints);
  const inRange = (timestamp: number) => since === null || timestamp >= since;
  const leadTimestamp = (lead: Lead) => latest.get(lead.id!)?.occurredAt ?? lead.createdAt;
  const leadsInRange = leads.filter((lead) => inRange(leadTimestamp(lead)));
  const linkedin = leadsInRange.filter((lead) => lead.channel === "LinkedIn");
  const emailTouchpoints = leadsInRange.filter((lead) => lead.channel === "Email").map((lead) => latest.get(lead.id!)).filter((touchpoint): touchpoint is LeadTouchpoint => Boolean(touchpoint));

  return {
    linkedinNew: linkedin.filter((lead) => lead.status === "New").length,
    linkedinContacted: linkedin.filter((lead) => lead.status === "Contacted").length,
    linkedinReplied: linkedin.filter((lead) => lead.status === "Replied").length,
    emailNoReply: emailTouchpoints.filter((touchpoint) => ["Sent", "No Response"].includes(touchpoint.status) && !isReplied(touchpoint)).length,
    emailReplied: emailTouchpoints.filter(isReplied).length,
    applicationsApplied: applications.filter((a) => a.status === "Applied" && inRange(a.createdAt)).length,
    interviews: applications.filter((a) => a.status === "Interview" && inRange(a.createdAt)).length,
    offers: applications.filter((a) => a.status === "Offer" && inRange(a.createdAt)).length,
  };
}

export async function getDashboardLists(): Promise<{ followUps: DashboardFollowUpItem[]; staleOutreach: DashboardStaleOutreachItem[] }> {
  const database = getDB();
  const [leads, touchpoints, companies] = await Promise.all([database.leads.toArray(), database.leadTouchpoints.toArray(), database.companies.toArray()]);
  const companyNames = new Map(companies.map((company) => [company.id!, company.companyName]));
  const latest = latestTouchpoints(touchpoints);
  const today = startOfDay(new Date());
  const todayString = today.toISOString().slice(0, 10);
  const followUps: DashboardFollowUpItem[] = [];
  const staleOutreach: DashboardStaleOutreachItem[] = [];

  for (const lead of leads) {
    if (!lead.id) continue;
    const raw = lead as Lead & { nextFollowUpDate?: string; firstFollowUpDate?: string; secondFollowUpDate?: string };
    const followUpDate = raw.nextFollowUpDate ?? raw.firstFollowUpDate ?? raw.secondFollowUpDate;
    const companyName = companyNames.get(lead.companyId) ?? "Unknown company";
    if (followUpDate === todayString && (lead.channel === "LinkedIn" || lead.channel === "Email")) followUps.push({ id: lead.id, name: lead.name, companyName, channel: lead.channel, type: lead.channel === "Email" ? "Cold Email" : "Lead", href: `/job-search/leads?leadId=${lead.id}` });

    const touchpoint = latest.get(lead.id);
    if (!touchpoint || !["LinkedIn", "Email"].includes(lead.channel) || isReplied(touchpoint) || (lead.status !== "Contacted" && touchpoint.status !== "Sent")) continue;
    const days = differenceInCalendarDays(today, new Date(touchpoint.occurredAt));
    if (days >= 7) {
      const channel = lead.channel === "Email" ? "Email" : "LinkedIn";
      staleOutreach.push({ id: lead.id, name: lead.name, companyName, channel, daysSinceLastTouchpoint: days, href: `/job-search/leads?leadId=${lead.id}` });
    }
  }
  return { followUps, staleOutreach };
}
