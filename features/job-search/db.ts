import Dexie, { type EntityTable } from "dexie";

import type {
  ActivityLog,
  Application,
  ColdEmail,
  Company,
  Lead,
  Template,
} from "./types";

import { LEGACY_LEAD_CHANNEL } from "./constants";

class JobSearchDatabase extends Dexie {
  companies!: EntityTable<Company, "id">;
  leads!: EntityTable<Lead, "id">;
  applications!: EntityTable<Application, "id">;
  coldEmails!: EntityTable<ColdEmail, "id">;
  templates!: EntityTable<Template, "id">;
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

    this.version(2)
      .stores({
        companies:
          "++id, companyName, sector, createdAt",
        leads:
          "++id, companyId, name, role, type, channel, status, firstFollowUpDate, secondFollowUpDate, createdAt",
        applications:
          "++id, companyId, role, portal, status, appliedDate, createdAt",
        coldEmails:
          "++id, companyId, leadId, role, status, sentDate, firstFollowUpDate, secondFollowUpDate, createdAt",
        activityLogs: "++id, entityType, entityId, action, timestamp",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("leads")
          .toCollection()
          .modify((lead) => {
            if (!lead.channel) {
              lead.channel = LEGACY_LEAD_CHANNEL;
            }
          });
      });

    this.version(3).stores({
      companies:
        "++id, companyName, sector, createdAt",
      leads:
        "++id, companyId, name, role, type, channel, status, firstFollowUpDate, secondFollowUpDate, createdAt",
      applications:
        "++id, companyId, role, portal, status, appliedDate, createdAt",
      coldEmails:
        "++id, companyId, leadId, role, status, sentDate, firstFollowUpDate, secondFollowUpDate, createdAt",
      templates: "++id, type, title, createdAt, updatedAt",
      activityLogs: "++id, entityType, entityId, action, timestamp",
    });

    this.version(4)
      .stores({
        companies:
          "++id, companyName, sector, createdAt",
        leads:
          "++id, companyId, name, role, type, channel, status, firstFollowUpDate, secondFollowUpDate, templateId, followUpTemplateId, createdAt",
        applications:
          "++id, companyId, role, portal, status, appliedDate, createdAt",
        coldEmails:
          "++id, companyId, leadId, role, status, sentDate, firstFollowUpDate, secondFollowUpDate, templateId, followUpTemplateId, createdAt",
        templates: "++id, type, title, createdAt, updatedAt",
        activityLogs: "++id, entityType, entityId, action, timestamp",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("leads")
          .toCollection()
          .modify((lead) => {
            if (lead.templateId === undefined) {
              lead.templateId = null;
            }
            if (lead.followUpTemplateId === undefined) {
              lead.followUpTemplateId = null;
            }
          });

        await transaction
          .table("coldEmails")
          .toCollection()
          .modify((coldEmail) => {
            if (coldEmail.templateId === undefined) {
              coldEmail.templateId = null;
            }
            if (coldEmail.followUpTemplateId === undefined) {
              coldEmail.followUpTemplateId = null;
            }
          });
      });

    this.version(5)
      .stores({
        companies:
          "++id, companyName, sector, createdAt",
        leads:
          "++id, companyId, name, role, type, channel, status, firstFollowUpDate, secondFollowUpDate, templateId, followUpTemplateId, createdAt",
        applications:
          "++id, companyId, role, portal, status, appliedDate, createdAt",
        coldEmails:
          "++id, companyId, leadId, role, status, sentDate, firstFollowUpDate, secondFollowUpDate, templateId, followUpTemplateId, createdAt",
        templates: "++id, type, title, createdAt, updatedAt",
        activityLogs: "++id, entityType, entityId, action, timestamp",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("leads")
          .toCollection()
          .modify((lead: Lead) => {
            if (lead.xProfile === undefined) {
              lead.xProfile = "";
            }
            if (
              lead.channel === "X" &&
              !lead.xProfile.trim() &&
              lead.linkedin?.trim()
            ) {
              lead.xProfile = lead.linkedin;
            }
          });
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
