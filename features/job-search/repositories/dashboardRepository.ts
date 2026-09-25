import { getTimeFilterStart } from "../lib/dateUtils";
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
} from "../repositories/leadsRepository";
import type {
  DashboardStats,
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

export async function getDashboardRecent() {
  const [companies, leads, applications, recentTouchpoints] = await Promise.all([
    getRecentCompanies(5),
    getRecentLeads(5),
    getRecentApplications(5),
    getRecentTouchpoints(5),
  ]);
  return { companies, leads, applications, recentTouchpoints };
}
