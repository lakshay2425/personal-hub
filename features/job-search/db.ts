import Dexie, { type EntityTable } from "dexie";

import type {
  ActivityLog,
  Application,
  ColdEmail,
  Company,
  Lead,
} from "./types";

class JobSearchDatabase extends Dexie {
  companies!: EntityTable<Company, "id">;
  leads!: EntityTable<Lead, "id">;
  applications!: EntityTable<Application, "id">;
  coldEmails!: EntityTable<ColdEmail, "id">;
  activityLogs!: EntityTable<ActivityLog, "id">;

  constructor() {
    super("job-search-tracker-db");

    this.version(1).stores({
      companies:
        "++id, companyName, sector, createdAt",
      leads:
        "++id, companyId, name, role, type, status, firstFollowUpDate, secondFollowUpDate, createdAt",
      applications:
        "++id, companyId, role, portal, status, appliedDate, createdAt",
      coldEmails:
        "++id, companyId, leadId, role, status, sentDate, firstFollowUpDate, secondFollowUpDate, createdAt",
      activityLogs: "++id, entityType, entityId, action, timestamp",
    });
  }
}

export const db =
  typeof window !== "undefined"
    ? new JobSearchDatabase()
    : (null as unknown as JobSearchDatabase);

export function getDB(): JobSearchDatabase {
  if (!db) {
    throw new Error("IndexedDB is only available in the browser");
  }
  return db;
}
