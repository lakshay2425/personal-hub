import { assertBackupShape } from "@/lib/export/validateBackup";

import { getDB } from "../db";
import type {
  ActivityLog,
  Application,
  ColdEmail,
  Company,
  Lead,
} from "../types";

const REQUIRED_ARRAYS = [
  "companies",
  "leads",
  "applications",
  "coldEmails",
  "activityLogs",
] as const;

export type JobSearchBackupPayload = {
  version: 1;
  companies: Company[];
  leads: Lead[];
  applications: Application[];
  coldEmails: ColdEmail[];
  activityLogs: ActivityLog[];
};

export function validateJobSearchBackup(data: unknown): JobSearchBackupPayload {
  const arrays = assertBackupShape(data, [...REQUIRED_ARRAYS]);

  return {
    version: 1,
    companies: arrays.companies as Company[],
    leads: arrays.leads as Lead[],
    applications: arrays.applications as Application[],
    coldEmails: arrays.coldEmails as ColdEmail[],
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
      db.activityLogs,
    ],
    async () => {
      await Promise.all([
        db.companies.clear(),
        db.leads.clear(),
        db.applications.clear(),
        db.coldEmails.clear(),
        db.activityLogs.clear(),
      ]);

      await Promise.all([
        db.companies.bulkPut(payload.companies),
        db.leads.bulkPut(payload.leads),
        db.applications.bulkPut(payload.applications),
        db.coldEmails.bulkPut(payload.coldEmails),
        db.activityLogs.bulkPut(payload.activityLogs),
      ]);
    },
  );
}
