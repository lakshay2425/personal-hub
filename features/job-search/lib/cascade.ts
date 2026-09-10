import { getDB } from "../db";
import {
  deleteActivityLogsForEntities,
  deleteActivityLogsForEntity,
  logActivity,
} from "./activityLog";
import type { Application, Lead } from "../types";

export async function deleteCompanyCascade(companyId: number): Promise<void> {
  const database = getDB();

  await database.transaction(
    "rw",
    [
      database.companies,
      database.leads,
      database.applications,
      database.leadTouchpoints,
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

      const leadIds = leads.map((lead: Lead) => lead.id!).filter(Boolean);
      const applicationIds = applications
        .map((app: Application) => app.id!)
        .filter(Boolean);

      if (leadIds.length > 0) {
        await database.leadTouchpoints
          .where("leadId")
          .anyOf(leadIds)
          .delete();
      }

      await database.leads.where("companyId").equals(companyId).delete();
      await database.applications
        .where("companyId")
        .equals(companyId)
        .delete();

      await deleteActivityLogsForEntity("company", companyId);
      await deleteActivityLogsForEntities("lead", leadIds);
      await deleteActivityLogsForEntities("application", applicationIds);

      await database.companies.delete(companyId);
      await logActivity("company", companyId, "Company Deleted");
    },
  );
}

export async function deleteLeadWithLogs(leadId: number): Promise<void> {
  const database = getDB();
  await database.transaction(
    "rw",
    [database.leads, database.leadTouchpoints, database.activityLogs],
    async () => {
      await database.leadTouchpoints.where("leadId").equals(leadId).delete();
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

export async function deleteTemplateWithLogs(
  templateId: number,
): Promise<void> {
  const database = getDB();
  await database.transaction(
    "rw",
    [database.templates, database.activityLogs],
    async () => {
      await deleteActivityLogsForEntity("template", templateId);
      await database.templates.delete(templateId);
      await logActivity("template", templateId, "Template Deleted");
    },
  );
}
