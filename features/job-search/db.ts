import Dexie, { type EntityTable } from "dexie";

import {
  DEFAULT_CONTACTED_LEAD_STATUS,
  DEFAULT_CONTACTED_TRIGGER_STATUSES,
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_TOUCHPOINT_STATUS,
  LEGACY_LEAD_CHANNEL,
  LIST_SETTINGS_ID,
} from "./constants";
import { createDefaultListSettings } from "./repositories/listSettingsRepository";
import type {
  ActivityLog,
  Application,
  Company,
  JobSearchListSettings,
  Lead,
  LeadTouchpoint,
  ProductOutreachContact,
  ProductOutreachInteraction,
  Template,
} from "./types";

function parseDateToTimestamp(dateStr: string, fallback: number): number {
  if (!dateStr?.trim()) return fallback;
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.getTime();
}

function mapLegacyColdEmailStatus(status: string): string {
  switch (status) {
    case "Draft":
      return "Draft";
    case "Sent":
      return "Sent";
    case "Replied":
    case "Positive Response":
      return "Replied";
    case "Rejected":
    case "Closed":
      return "Sent";
    default:
      return DEFAULT_TOUCHPOINT_STATUS;
  }
}

function normalizeLegacyLeadStatus(status: string): string {
  if (
    status === "Replied" ||
    status === "Inactive" ||
    status === "Contacted"
  ) {
    return DEFAULT_CONTACTED_LEAD_STATUS;
  }
  return DEFAULT_NEW_LEAD_STATUS;
}

class JobSearchDatabase extends Dexie {
  companies!: EntityTable<Company, "id">;
  leads!: EntityTable<Lead, "id">;
  applications!: EntityTable<Application, "id">;
  templates!: EntityTable<Template, "id">;
  activityLogs!: EntityTable<ActivityLog, "id">;
  productOutreachContacts!: EntityTable<ProductOutreachContact, "id">;
  productOutreachInteractions!: EntityTable<
    ProductOutreachInteraction,
    "id"
  >;
  leadTouchpoints!: EntityTable<LeadTouchpoint, "id">;
  listSettings!: EntityTable<JobSearchListSettings, "id">;

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

    this.version(6).stores({
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
      productOutreachContacts: "++id, label, createdAt",
      productOutreachInteractions:
        "++id, contactId, channel, handle, createdAt",
    });

    this.version(7)
      .stores({
        companies:
          "++id, companyName, sector, createdAt",
        leads:
          "++id, companyId, name, role, type, channel, status, firstFollowUpDate, secondFollowUpDate, followUpTemplateId, createdAt",
        applications:
          "++id, companyId, role, portal, status, appliedDate, createdAt",
        templates: "++id, type, title, createdAt, updatedAt",
        activityLogs: "++id, entityType, entityId, action, timestamp",
        productOutreachContacts: "++id, label, createdAt",
        productOutreachInteractions:
          "++id, contactId, channel, handle, createdAt",
        leadTouchpoints:
          "++id, leadId, channel, status, type, occurredAt, createdAt",
        listSettings: "id",
      })
      .upgrade(async (transaction) => {
        const coldEmailsTable = transaction.table("coldEmails");
        const leadsTable = transaction.table("leads");
        const touchpointsTable = transaction.table("leadTouchpoints");
        const listSettingsTable = transaction.table("listSettings");

        const coldEmails = await coldEmailsTable.toArray();
        const leads = await leadsTable.toArray();
        const leadIds = new Set(
          leads
            .map((lead: Lead) => lead.id)
            .filter((id): id is number => id !== undefined),
        );

        const contactedLeadIds = new Set<number>();

        for (const coldEmail of coldEmails) {
          if (!coldEmail.leadId || !leadIds.has(coldEmail.leadId)) {
            continue;
          }

          const status = mapLegacyColdEmailStatus(coldEmail.status ?? "");
          const occurredAt = parseDateToTimestamp(
            coldEmail.sentDate,
            coldEmail.createdAt ?? Date.now(),
          );

          await touchpointsTable.add({
            leadId: coldEmail.leadId,
            channel: "Email",
            type: "Initial",
            status,
            templateId: coldEmail.templateId ?? null,
            context: coldEmail.notes ?? "",
            occurredAt,
            createdAt: coldEmail.createdAt ?? Date.now(),
          });

          if (DEFAULT_CONTACTED_TRIGGER_STATUSES.includes(status)) {
            contactedLeadIds.add(coldEmail.leadId);
          }
        }

        for (const lead of leads) {
          const normalizedStatus = normalizeLegacyLeadStatus(lead.status ?? "");
          const shouldBeContacted =
            contactedLeadIds.has(lead.id!) ||
            normalizedStatus === DEFAULT_CONTACTED_LEAD_STATUS;

          await leadsTable.update(lead.id!, {
            status: shouldBeContacted
              ? DEFAULT_CONTACTED_LEAD_STATUS
              : DEFAULT_NEW_LEAD_STATUS,
            firstFollowUpDate: lead.firstFollowUpDate || null,
            secondFollowUpDate: lead.secondFollowUpDate || null,
            followUpTemplateId: lead.followUpTemplateId ?? null,
            templateId: undefined,
          });
        }

        await listSettingsTable.put(createDefaultListSettings());
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

export { LIST_SETTINGS_ID };
