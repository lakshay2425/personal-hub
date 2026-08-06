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
  getRecentColdEmails,
  getTodayFollowUpColdEmails,
} from "../repositories/coldEmailsRepository";
import {
  countLeadsSince,
  getRecentLeads,
  getTodayFollowUpLeads,
} from "../repositories/leadsRepository";
import { getCompanyById } from "../repositories/companiesRepository";
import { getLeadById } from "../repositories/leadsRepository";
import type {
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

export async function getTodayFollowUps(): Promise<FollowUpItem[]> {
  const today = getTodayDateString();
  const [leads, coldEmails] = await Promise.all([
    getTodayFollowUpLeads(today),
    getTodayFollowUpColdEmails(today),
  ]);

  const items: FollowUpItem[] = [];

  for (const lead of leads) {
    const company = await getCompanyById(lead.companyId);
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

  for (const email of coldEmails) {
    const [company, lead] = await Promise.all([
      getCompanyById(email.companyId),
      getLeadById(email.leadId),
    ]);
    if (email.firstFollowUpDate === today) {
      items.push({
        id: email.id!,
        entityType: "coldEmail",
        companyName: company?.companyName ?? "Unknown",
        leadName: lead?.name ?? "Unknown",
        role: email.role,
        followUpType: "First",
        entityId: email.id!,
      });
    }
    if (email.secondFollowUpDate === today) {
      items.push({
        id: email.id!,
        entityType: "coldEmail",
        companyName: company?.companyName ?? "Unknown",
        leadName: lead?.name ?? "Unknown",
        role: email.role,
        followUpType: "Second",
        entityId: email.id!,
      });
    }
  }

  return items;
}

export async function getDashboardRecent() {
  const [companies, leads, applications, coldEmails] = await Promise.all([
    getRecentCompanies(5),
    getRecentLeads(5),
    getRecentApplications(5),
    getRecentColdEmails(5),
  ]);
  return { companies, leads, applications, coldEmails };
}
