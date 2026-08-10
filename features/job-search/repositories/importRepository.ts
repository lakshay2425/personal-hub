import { InvalidBackupError } from "@/lib/export/validateBackup";

import { isLeadChannel, LEGACY_LEAD_CHANNEL } from "../constants";
import { getDB } from "../db";
import { backfillLeadProfileFields } from "../lib/leadProfileUtils";
import type {
  ActivityLog,
  Application,
  ColdEmail,
  Company,
  Lead,
  Template,
} from "../types";

const CORE_ARRAYS = [
  "companies",
  "leads",
  "applications",
  "coldEmails",
  "activityLogs",
] as const;

export type JobSearchBackupPayload = {
  version: 1 | 2 | 3 | 4;
  companies: Company[];
  leads: Lead[];
  applications: Application[];
  coldEmails: ColdEmail[];
  templates: Template[];
  activityLogs: ActivityLog[];
};

function normalizeTemplateRef(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function assertCoreBackupShape(data: unknown): Record<string, unknown[]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new InvalidBackupError();
  }

  const record = data as Record<string, unknown>;
  const version = record.version;

  if (version !== 1 && version !== 2 && version !== 3 && version !== 4) {
    throw new InvalidBackupError();
  }

  for (const key of CORE_ARRAYS) {
    if (!Array.isArray(record[key])) {
      throw new InvalidBackupError();
    }
  }

  return Object.fromEntries(
    CORE_ARRAYS.map((key) => [key, record[key] as unknown[]]),
  );
}

export function validateJobSearchBackup(data: unknown): JobSearchBackupPayload {
  const arrays = assertCoreBackupShape(data);
  const record = data as Record<string, unknown>;
  const templates = Array.isArray(record.templates)
    ? (record.templates as Template[])
    : [];

  return {
    version: 4,
    companies: arrays.companies as Company[],
    leads: (arrays.leads as Lead[]).map((lead) => {
      const channel = isLeadChannel(lead.channel)
        ? lead.channel
        : LEGACY_LEAD_CHANNEL;

      return backfillLeadProfileFields({
        ...lead,
        channel,
        firstFollowUpDate:
          channel === "Email" ? lead.firstFollowUpDate || null : null,
        secondFollowUpDate:
          channel === "Email" ? lead.secondFollowUpDate || null : null,
        templateId: normalizeTemplateRef(lead.templateId),
        followUpTemplateId: normalizeTemplateRef(lead.followUpTemplateId),
        xProfile: lead.xProfile ?? "",
      });
    }),
    applications: arrays.applications as Application[],
    coldEmails: (arrays.coldEmails as ColdEmail[]).map((coldEmail) => ({
      ...coldEmail,
      templateId: normalizeTemplateRef(coldEmail.templateId),
      followUpTemplateId: normalizeTemplateRef(coldEmail.followUpTemplateId),
    })),
    templates,
    activityLogs: arrays.activityLogs as ActivityLog[],
  };
}

export async function importJobSearchData(
  payload: JobSearchBackupPayload,
): Promise<void> {
  const db = getDB();

  await db.transaction(
    "rw",
    [
      db.companies,
      db.leads,
      db.applications,
      db.coldEmails,
      db.templates,
      db.activityLogs,
    ],
    async () => {
      await Promise.all([
        db.companies.clear(),
        db.leads.clear(),
        db.applications.clear(),
        db.coldEmails.clear(),
        db.templates.clear(),
        db.activityLogs.clear(),
      ]);

      await Promise.all([
        db.companies.bulkPut(payload.companies),
        db.leads.bulkPut(payload.leads),
        db.applications.bulkPut(payload.applications),
        db.coldEmails.bulkPut(payload.coldEmails),
        db.templates.bulkPut(payload.templates),
        db.activityLogs.bulkPut(payload.activityLogs),
      ]);
    },
  );
}
