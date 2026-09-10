import { InvalidBackupError } from "@/lib/export/validateBackup";

import {
  DEFAULT_CONTACTED_LEAD_STATUS,
  DEFAULT_CONTACTED_TRIGGER_STATUSES,
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_TOUCHPOINT_STATUS,
  isLeadChannel,
  isProductOutreachChannel,
  LEGACY_LEAD_CHANNEL,
} from "../constants";
import { getDB } from "../db";
import { backfillLeadProfileFields } from "../lib/leadProfileUtils";
import { createDefaultListSettings } from "./listSettingsRepository";
import type {
  ActivityLog,
  Application,
  Company,
  JobSearchListSettings,
  Lead,
  LeadTouchpoint,
  LegacyColdEmail,
  ProductOutreachContact,
  ProductOutreachInteraction,
  Template,
} from "../types";

const CORE_ARRAYS = [
  "companies",
  "leads",
  "applications",
  "activityLogs",
] as const;

export type JobSearchBackupPayload = {
  version: 1 | 2 | 3 | 4 | 5 | 6;
  companies: Company[];
  leads: Lead[];
  applications: Application[];
  leadTouchpoints: LeadTouchpoint[];
  templates: Template[];
  activityLogs: ActivityLog[];
  productOutreachContacts: ProductOutreachContact[];
  productOutreachInteractions: ProductOutreachInteraction[];
  listSettings: JobSearchListSettings[];
};

function normalizeTemplateRef(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

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

function legacyColdEmailsToTouchpoints(
  coldEmails: LegacyColdEmail[],
  leadIds: Set<number>,
): LeadTouchpoint[] {
  const touchpoints: LeadTouchpoint[] = [];

  for (const coldEmail of coldEmails) {
    if (!coldEmail.leadId || !leadIds.has(coldEmail.leadId)) continue;

    touchpoints.push({
      leadId: coldEmail.leadId,
      channel: "Email",
      type: "Initial",
      status: mapLegacyColdEmailStatus(coldEmail.status ?? ""),
      templateId: normalizeTemplateRef(coldEmail.templateId),
      context: coldEmail.notes ?? "",
      occurredAt: parseDateToTimestamp(
        coldEmail.sentDate,
        coldEmail.createdAt ?? Date.now(),
      ),
      createdAt: coldEmail.createdAt ?? Date.now(),
    });
  }

  return touchpoints;
}

function assertCoreBackupShape(data: unknown): Record<string, unknown[]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new InvalidBackupError();
  }

  const record = data as Record<string, unknown>;
  const version = record.version;

  if (
    version !== 1 &&
    version !== 2 &&
    version !== 3 &&
    version !== 4 &&
    version !== 5 &&
    version !== 6
  ) {
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

  const normalizedLeads = (arrays.leads as Lead[]).map((lead) => {
    const channel = isLeadChannel(lead.channel)
      ? lead.channel
      : LEGACY_LEAD_CHANNEL;

    return backfillLeadProfileFields({
      ...lead,
      channel,
      status: normalizeLegacyLeadStatus(lead.status ?? DEFAULT_NEW_LEAD_STATUS),
      firstFollowUpDate: lead.firstFollowUpDate || null,
      secondFollowUpDate: lead.secondFollowUpDate || null,
      followUpTemplateId: normalizeTemplateRef(lead.followUpTemplateId),
      xProfile: lead.xProfile ?? "",
    });
  });

  const leadIds = new Set(
    normalizedLeads
      .map((lead) => lead.id)
      .filter((id): id is number => id !== undefined),
  );

  const legacyColdEmails = Array.isArray(record.coldEmails)
    ? (record.coldEmails as LegacyColdEmail[])
    : [];

  const importedTouchpoints = Array.isArray(record.leadTouchpoints)
    ? (record.leadTouchpoints as LeadTouchpoint[]).map((touchpoint) => ({
        ...touchpoint,
        channel: isLeadChannel(touchpoint.channel)
          ? touchpoint.channel
          : LEGACY_LEAD_CHANNEL,
        type: touchpoint.type?.trim() || "Other",
        status: touchpoint.status?.trim() || DEFAULT_TOUCHPOINT_STATUS,
        templateId: normalizeTemplateRef(touchpoint.templateId),
        context: touchpoint.context ?? "",
      }))
    : [];

  const migratedTouchpoints =
    importedTouchpoints.length > 0
      ? importedTouchpoints
      : legacyColdEmailsToTouchpoints(legacyColdEmails, leadIds);

  const contactedLeadIds = new Set<number>();
  for (const touchpoint of migratedTouchpoints) {
    if (DEFAULT_CONTACTED_TRIGGER_STATUSES.includes(touchpoint.status)) {
      contactedLeadIds.add(touchpoint.leadId);
    }
  }

  const leadsWithStatus = normalizedLeads.map((lead) => {
    if (lead.id !== undefined && contactedLeadIds.has(lead.id)) {
      return { ...lead, status: DEFAULT_CONTACTED_LEAD_STATUS };
    }
    return lead;
  });

  const listSettings = Array.isArray(record.listSettings)
    ? (record.listSettings as JobSearchListSettings[])
    : [createDefaultListSettings()];

  return {
    version: 6,
    companies: arrays.companies as Company[],
    leads: leadsWithStatus,
    applications: arrays.applications as Application[],
    leadTouchpoints: migratedTouchpoints,
    templates,
    activityLogs: arrays.activityLogs as ActivityLog[],
    productOutreachContacts: Array.isArray(record.productOutreachContacts)
      ? (record.productOutreachContacts as ProductOutreachContact[])
      : [],
    productOutreachInteractions: Array.isArray(
      record.productOutreachInteractions,
    )
      ? (
          record.productOutreachInteractions as ProductOutreachInteraction[]
        ).map((interaction) => ({
          ...interaction,
          channel: isProductOutreachChannel(interaction.channel)
            ? interaction.channel
            : "Instagram",
        }))
      : [],
    listSettings,
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
      db.leadTouchpoints,
      db.templates,
      db.activityLogs,
      db.productOutreachContacts,
      db.productOutreachInteractions,
      db.listSettings,
    ],
    async () => {
      await Promise.all([
        db.companies.clear(),
        db.leads.clear(),
        db.applications.clear(),
        db.leadTouchpoints.clear(),
        db.templates.clear(),
        db.activityLogs.clear(),
        db.productOutreachContacts.clear(),
        db.productOutreachInteractions.clear(),
        db.listSettings.clear(),
      ]);

      await Promise.all([
        db.companies.bulkPut(payload.companies),
        db.leads.bulkPut(payload.leads),
        db.applications.bulkPut(payload.applications),
        db.leadTouchpoints.bulkPut(payload.leadTouchpoints),
        db.templates.bulkPut(payload.templates),
        db.activityLogs.bulkPut(payload.activityLogs),
        db.productOutreachContacts.bulkPut(payload.productOutreachContacts),
        db.productOutreachInteractions.bulkPut(
          payload.productOutreachInteractions,
        ),
        db.listSettings.bulkPut(payload.listSettings),
      ]);
    },
  );
}
