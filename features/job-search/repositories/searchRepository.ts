import { getDB } from "../db";
import { getLeadPageHref } from "../constants";
import { searchApplications } from "../repositories/applicationsRepository";
import { searchCompanies } from "../repositories/companiesRepository";
import { searchLeads } from "../repositories/leadsRepository";
import type { Company, GlobalSearchResult } from "../types";

function buildCompanyMap(companies: (Company | undefined)[]): Map<number, Company> {
  const map = new Map<number, Company>();
  for (const company of companies) {
    if (company?.id !== undefined) {
      map.set(company.id, company);
    }
  }
  return map;
}

export async function globalSearch(
  query: string,
): Promise<GlobalSearchResult[]> {
  if (!query.trim()) return [];

  const [companies, leads, applications] = await Promise.all([
    searchCompanies(query),
    searchLeads(query),
    searchApplications(query),
  ]);

  const topLeads = leads.slice(0, 5);
  const topApplications = applications.slice(0, 5);
  const companyIds = [
    ...new Set([
      ...topLeads.map((lead) => lead.companyId),
      ...topApplications.map((app) => app.companyId),
    ]),
  ];

  const database = getDB();
  const relatedCompanies = await database.companies.bulkGet(companyIds);
  const companyMap = buildCompanyMap(relatedCompanies);

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

  for (const lead of topLeads) {
    const company = companyMap.get(lead.companyId);
    results.push({
      type: "lead",
      id: lead.id!,
      title: lead.name,
      subtitle: company?.companyName ?? "Lead",
      href: getLeadPageHref(lead.channel),
    });
  }

  for (const app of topApplications) {
    const company = companyMap.get(app.companyId);
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
