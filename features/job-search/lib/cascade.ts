import { getDB } from "../db";
import {
  deleteActivityLogsForEntities,
  deleteActivityLogsForEntity,
  logActivity,
} from "./activityLog";
import type { Application, ColdEmail, Lead } from "../types";

export async function deleteCompanyCascade(companyId: number): Promise<void> {
  const database = getDB();

  await database.transaction(
    "rw",
    [
      database.companies,
      database.leads,
      database.applications,
      database.coldEmails,
      database.activityLogs,
    ],
    async () => {
      const leads = await database.leads
        .where("companyId")
        .equals(companyId)
        .toArray();
      const applications = await database.applications
        .where("companyId")
        .equals(companyId)
        .toArray();
      const coldEmails = await database.coldEmails
        .where("companyId")
        .equals(companyId)
        .toArray();

      const leadIds = leads.map((l: Lead) => l.id!).filter(Boolean);
      const applicationIds = applications
        .map((a: Application) => a.id!)
        .filter(Boolean);
      const coldEmailIds = coldEmails
        .map((c: ColdEmail) => c.id!)
        .filter(Boolean);

      await database.leads.where("companyId").equals(companyId).delete();
      await database.applications
        .where("companyId")
        .equals(companyId)
        .delete();
      await database.coldEmails
        .where("companyId")
        .equals(companyId)
        .delete();

      await deleteActivityLogsForEntity("company", companyId);
      await deleteActivityLogsForEntities("lead", leadIds);
      await deleteActivityLogsForEntities("application", applicationIds);
      await deleteActivityLogsForEntities("coldEmail", coldEmailIds);

      await database.companies.delete(companyId);
      await logActivity("company", companyId, "Company Deleted");
    },
  );
}

export async function deleteLeadWithLogs(leadId: number): Promise<void> {
  const database = getDB();
  await database.transaction(
    "rw",
    [database.leads, database.activityLogs],
    async () => {
      await deleteActivityLogsForEntity("lead", leadId);
      await database.leads.delete(leadId);
      await logActivity("lead", leadId, "Lead Deleted");
    },
  );
}

export async function deleteApplicationWithLogs(
  applicationId: number,
): Promise<void> {
  const database = getDB();
  await database.transaction(
    "rw",
    [database.applications, database.activityLogs],
    async () => {
      await deleteActivityLogsForEntity("application", applicationId);
      await database.applications.delete(applicationId);
      await logActivity("application", applicationId, "Application Deleted");
    },
  );
}

export async function deleteColdEmailWithLogs(
  coldEmailId: number,
): Promise<void> {
  const database = getDB();
  await database.transaction(
    "rw",
    [database.coldEmails, database.activityLogs],
    async () => {
      await deleteActivityLogsForEntity("coldEmail", coldEmailId);
      await database.coldEmails.delete(coldEmailId);
      await logActivity("coldEmail", coldEmailId, "Cold Email Deleted");
    },
  );
}
