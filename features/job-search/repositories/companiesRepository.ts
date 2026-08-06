import { getDB } from "../db";
import { logActivity } from "../lib/activityLog";
import { deleteCompanyCascade } from "../lib/cascade";
import type { Company, CompanyWithCounts } from "../types";

export async function getAllCompanies(): Promise<Company[]> {
  const database = getDB();
  return database.companies.orderBy("createdAt").reverse().toArray();
}

export async function getCompanyById(id: number): Promise<Company | undefined> {
  const database = getDB();
  return database.companies.get(id);
}

export async function getCompaniesWithCounts(): Promise<CompanyWithCounts[]> {
  const database = getDB();
  const [companies, leads, applications] = await Promise.all([
    database.companies.toArray(),
    database.leads.toArray(),
    database.applications.toArray(),
  ]);

  const leadsCountByCompany = new Map<number, number>();
  const applicationsCountByCompany = new Map<number, number>();

  for (const lead of leads) {
    leadsCountByCompany.set(
      lead.companyId,
      (leadsCountByCompany.get(lead.companyId) ?? 0) + 1,
    );
  }

  for (const application of applications) {
    applicationsCountByCompany.set(
      application.companyId,
      (applicationsCountByCompany.get(application.companyId) ?? 0) + 1,
    );
  }

  return companies.map((company: Company) => {
    const id = company.id!;
    return {
      ...company,
      id,
      leadsCount: leadsCountByCompany.get(id) ?? 0,
      applicationsCount: applicationsCountByCompany.get(id) ?? 0,
    };
  });
}

export async function createCompany(
  data: Omit<Company, "id" | "createdAt" | "updatedAt">,
): Promise<number> {
  const database = getDB();
  const now = Date.now();
  const id = await database.companies.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  await logActivity("company", id as number, "Company Added");
  return id as number;
}

export async function updateCompany(
  id: number,
  data: Partial<Omit<Company, "id" | "createdAt">>,
): Promise<void> {
  const database = getDB();
  await database.companies.update(id, {
    ...data,
    updatedAt: Date.now(),
  });
  await logActivity("company", id, "Company Updated");
}

export async function deleteCompany(id: number): Promise<void> {
  await deleteCompanyCascade(id);
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const database = getDB();
  const lower = query.toLowerCase();
  const all = await database.companies.toArray();
  return all.filter((c: Company) =>
    c.companyName.toLowerCase().includes(lower),
  );
}

export async function getUniqueSectors(): Promise<string[]> {
  const database = getDB();
  const companies = await database.companies.toArray();
  const sectors = new Set(
    companies
      .map((c: Company) => c.sector)
      .filter((s: string) => s.trim()),
  );
  return Array.from(sectors).sort();
}

export async function getRecentCompanies(limit = 5): Promise<Company[]> {
  const database = getDB();
  return database.companies
    .orderBy("createdAt")
    .reverse()
    .limit(limit)
    .toArray();
}

export async function countCompaniesSince(since: number | null): Promise<number> {
  const database = getDB();
  if (since === null) return database.companies.count();
  return database.companies.where("createdAt").aboveOrEqual(since).count();
}
