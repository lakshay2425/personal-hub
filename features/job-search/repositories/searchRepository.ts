import { searchApplications } from "../repositories/applicationsRepository";
import { searchCompanies } from "../repositories/companiesRepository";
import { searchLeads } from "../repositories/leadsRepository";
import { getCompanyById } from "../repositories/companiesRepository";
import type { GlobalSearchResult } from "../types";

export async function globalSearch(
  query: string,
): Promise<GlobalSearchResult[]> {
  if (!query.trim()) return [];

  const [companies, leads, applications] = await Promise.all([
    searchCompanies(query),
    searchLeads(query),
    searchApplications(query),
  ]);

  const results: GlobalSearchResult[] = [];

  for (const company of companies.slice(0, 5)) {
    results.push({
      type: "company",
      id: company.id!,
      title: company.companyName,
      subtitle: company.sector || "Company",
      href: `/job-search/companies/${company.id}`,
    });
  }

  for (const lead of leads.slice(0, 5)) {
    const company = await getCompanyById(lead.companyId);
    results.push({
      type: "lead",
      id: lead.id!,
      title: lead.name,
      subtitle: company?.companyName ?? "Lead",
      href: "/job-search/leads",
    });
  }

  for (const app of applications.slice(0, 5)) {
    const company = await getCompanyById(app.companyId);
    results.push({
      type: "application",
      id: app.id!,
      title: app.role,
      subtitle: company?.companyName ?? "Application",
      href: "/job-search/applications",
    });
  }

  return results;
}
