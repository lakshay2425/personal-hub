import { getDB } from "../db";

export async function exportJobSearchData() {
  const db = getDB();
  const [
    companies,
    leads,
    applications,
    coldEmails,
    templates,
    activityLogs,
    productOutreachContacts,
    productOutreachInteractions,
  ] = await Promise.all([
    db.companies.toArray(),
    db.leads.toArray(),
    db.applications.toArray(),
    db.coldEmails.toArray(),
    db.templates.toArray(),
    db.activityLogs.toArray(),
    db.productOutreachContacts.toArray(),
    db.productOutreachInteractions.toArray(),
  ]);

  return {
    version: 5,
    exportedAt: new Date().toISOString(),
    companies,
    leads,
    applications,
    coldEmails,
    templates,
    activityLogs,
    productOutreachContacts,
    productOutreachInteractions,
  };
}
