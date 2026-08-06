import { getDB } from "../db";

export async function exportJobSearchData() {
  const db = getDB();
  const [companies, leads, applications, coldEmails, activityLogs] =
    await Promise.all([
      db.companies.toArray(),
      db.leads.toArray(),
      db.applications.toArray(),
      db.coldEmails.toArray(),
      db.activityLogs.toArray(),
    ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    companies,
    leads,
    applications,
    coldEmails,
    activityLogs,
  };
}
