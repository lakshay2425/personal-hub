import { getDB } from "../db";

export async function exportJobSearchData() {
  const db = getDB();
  const [companies, leads, applications, coldEmails, templates, activityLogs] =
    await Promise.all([
      db.companies.toArray(),
      db.leads.toArray(),
      db.applications.toArray(),
      db.coldEmails.toArray(),
      db.templates.toArray(),
      db.activityLogs.toArray(),
    ]);

  return {
    version: 4,
    exportedAt: new Date().toISOString(),
    companies,
    leads,
    applications,
    coldEmails,
    templates,
    activityLogs,
  };
}
