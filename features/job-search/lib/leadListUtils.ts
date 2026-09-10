import { isTimestampInWeek } from "./dateUtils";
import type { Company, LeadTouchpoint, LeadWithTouchpoints } from "../types";

export type LeadsViewMode = "allLeads" | "byTouchpoint";

export function leadCreatedInWeek(
  lead: LeadWithTouchpoints,
  weekStart: string,
): boolean {
  return isTimestampInWeek(lead.createdAt, weekStart);
}

export function leadHasAnyTouchpoint(lead: LeadWithTouchpoints): boolean {
  return lead.touchpoints.length > 0;
}

export function filterTouchpointsByWeek(
  touchpoints: LeadTouchpoint[],
  weekStart: string | null,
): LeadTouchpoint[] {
  if (!weekStart) return touchpoints;
  return touchpoints.filter((touchpoint) =>
    isTimestampInWeek(touchpoint.occurredAt, weekStart),
  );
}

export interface CompanyLeadGroup {
  companyId: number;
  companyName: string;
  leads: LeadWithTouchpoints[];
}

export function groupLeadsByCompany(
  leads: LeadWithTouchpoints[],
  companyById: Map<number, Company>,
): CompanyLeadGroup[] {
  const groups = new Map<number, LeadWithTouchpoints[]>();

  for (const lead of leads) {
    const list = groups.get(lead.companyId) ?? [];
    list.push(lead);
    groups.set(lead.companyId, list);
  }

  return Array.from(groups.entries())
    .map(([companyId, groupLeads]) => ({
      companyId,
      companyName: companyById.get(companyId)?.companyName ?? "Unknown",
      leads: groupLeads,
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
}
