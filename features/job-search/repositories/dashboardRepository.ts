import { getTimeFilterStart, getTodayDateString } from "../lib/dateUtils";
import {
  countApplicationsByStatusSince,
  countApplicationsSince,
  getRecentApplications,
} from "../repositories/applicationsRepository";
import {
  countCompaniesSince,
  getRecentCompanies,
} from "../repositories/companiesRepository";
import {
  getRecentTouchpoints,
} from "../repositories/leadTouchpointsRepository";
import {
  countLeadsSince,
  getRecentLeads,
  getTodayFollowUpLeads,
} from "../repositories/leadsRepository";
import { getDB } from "../db";
import type {
  Company,
  DashboardStats,
  FollowUpItem,
  TimeFilter,
} from "../types";

export async function getDashboardStats(
  filter: TimeFilter,
): Promise<DashboardStats> {
  const since = getTimeFilterStart(filter);
  const [totalCompanies, totalLeads, totalApplications, interviews, offers] =
    await Promise.all([
      countCompaniesSince(since),
      countLeadsSince(since),
      countApplicationsSince(since),
      countApplicationsByStatusSince("Interview", since),
      countApplicationsByStatusSince("Offer", since),
    ]);

  return {
    totalCompanies,
    totalLeads,
    totalApplications,
    interviews,
    offers,
  };
}

function buildEntityMap<T extends { id?: number }>(
  entities: (T | undefined)[],
): Map<number, T> {
  const map = new Map<number, T>();
  for (const entity of entities) {
    if (entity?.id !== undefined) {
      map.set(entity.id, entity);
    }
  }
  return map;
}

export async function getTodayFollowUps(): Promise<FollowUpItem[]> {
  const today = getTodayDateString();
  const leads = await getTodayFollowUpLeads(today);

  const companyIds = [...new Set(leads.map((lead) => lead.companyId))];
  const database = getDB();
  const companies = await database.companies.bulkGet(companyIds);
  const companyMap = buildEntityMap<Company>(companies);

  const items: FollowUpItem[] = [];

  for (const lead of leads) {
    const company = companyMap.get(lead.companyId);
    if (lead.firstFollowUpDate === today) {
      items.push({
        id: lead.id!,
        entityType: "lead",
        companyName: company?.companyName ?? "Unknown",
        leadName: lead.name,
        role: lead.role,
        followUpType: "First",
        entityId: lead.id!,
      });
    }
    if (lead.secondFollowUpDate === today) {
      items.push({
        id: lead.id!,
        entityType: "lead",
        companyName: company?.companyName ?? "Unknown",
        leadName: lead.name,
        role: lead.role,
        followUpType: "Second",
        entityId: lead.id!,
      });
    }
  }

  return items;
}

export async function getDashboardRecent() {
  const [companies, leads, applications, recentTouchpoints] = await Promise.all([
    getRecentCompanies(5),
    getRecentLeads(5),
    getRecentApplications(5),
    getRecentTouchpoints(5),
  ]);
  return { companies, leads, applications, recentTouchpoints };
}
