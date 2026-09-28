import { getDB } from "../db";

export async function exportJobSearchData() {
  const db = getDB();
  const [
    companies,
    leads,
    applications,
    leadTouchpoints,
    templates,
    activityLogs,
    productOutreachContacts,
    productOutreachInteractions,
    listSettings,
    weeklyTargetSettings,
  ] = await Promise.all([
    db.companies.toArray(),
    db.leads.toArray(),
    db.applications.toArray(),
    db.leadTouchpoints.toArray(),
    db.templates.toArray(),
    db.activityLogs.toArray(),
    db.productOutreachContacts.toArray(),
    db.productOutreachInteractions.toArray(),
    db.listSettings.toArray(),
    db.weeklyTargetSettings.toArray(),
  ]);

  return {
    version: 7,
    exportedAt: new Date().toISOString(),
    companies,
    leads,
    applications,
    leadTouchpoints,
    templates,
    activityLogs,
    productOutreachContacts,
    productOutreachInteractions,
    listSettings,
    weeklyTargetSettings,
  };
}
