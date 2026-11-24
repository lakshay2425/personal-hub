import { InvalidBackupError } from "@/lib/export/validateBackup";

import {
  DEFAULT_CONTACTED_LEAD_STATUS,
  DEFAULT_CONTACTED_TRIGGER_STATUSES,
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_TOUCHPOINT_STATUS,
  isLeadChannel,
  isProductOutreachChannel,
  LEGACY_LEAD_CHANNEL,
  separateResponseFromStatus,
} from "../constants";
import { getDB } from "../db";
import { backfillLeadProfileFields } from "../lib/leadProfileUtils";
import {
  createDefaultListSettings,
  withResponseStatusDefaults,
} from "./listSettingsRepository";
import type {
  Achievement,
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
  WeeklyTargetSettings,
} from "../types";
import { createDefaultWeeklyTargetSettings } from "./weeklyTargetsRepository";

const CORE_ARRAYS = [
  "companies",
  "leads",
  "applications",
  "activityLogs",
] as const;

export type JobSearchBackupPayload = {
  version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  companies: Company[];
  leads: Lead[];
  applications: Application[];
  leadTouchpoints: LeadTouchpoint[];
  templates: Template[];
  achievements: Achievement[];
  activityLogs: ActivityLog[];
  productOutreachContacts: ProductOutreachContact[];
  productOutreachInteractions: ProductOutreachInteraction[];
  listSettings: JobSearchListSettings[];
  weeklyTargetSettings: WeeklyTargetSettings[];
};

function normalizeTemplateRef(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function normalizeDateOnly(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
    ? value
    : "";
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

    const separated = separateResponseFromStatus(
      mapLegacyColdEmailStatus(coldEmail.status ?? ""),
      undefined,
    );

    touchpoints.push({
      leadId: coldEmail.leadId,
      channel: "Email",
      type: "Initial",
      status: separated.status,
      responseStatus: separated.responseStatus,
      templateId: normalizeTemplateRef(coldEmail.templateId),
      purpose: "",
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
    version !== 6 &&
    version !== 7 &&
    version !== 8
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
  const achievements = Array.isArray(record.achievements)
    ? (record.achievements as Achievement[]).filter((achievement) =>
        achievement &&
        typeof achievement.title === "string" &&
        typeof achievement.conciseVersion === "string" &&
        typeof achievement.detailedVersion === "string" &&
        typeof achievement.createdAt === "number" &&
        typeof achievement.updatedAt === "number",
      )
    : [];

  const normalizedLeads = (arrays.leads as Lead[]).map((lead) => {
    const channel = isLeadChannel(lead.channel)
      ? lead.channel
      : LEGACY_LEAD_CHANNEL;

    const leadWithoutFollowUps = { ...lead } as Lead & {
      type?: string;
      firstFollowUpDate?: string | null;
      secondFollowUpDate?: string | null;
      followUpTemplateId?: number | null;
    };
    delete leadWithoutFollowUps.type;
    delete leadWithoutFollowUps.firstFollowUpDate;
    delete leadWithoutFollowUps.secondFollowUpDate;
    delete leadWithoutFollowUps.followUpTemplateId;

    return backfillLeadProfileFields({
      ...leadWithoutFollowUps,
      channel,
      status: normalizeLegacyLeadStatus(lead.status ?? DEFAULT_NEW_LEAD_STATUS),
      contactNumber: typeof lead.contactNumber === "string" ? lead.contactNumber : "",
      xProfile: lead.xProfile ?? "",
      isAlumni: lead.isAlumni === true,
      nextFollowUpDate: normalizeDateOnly(lead.nextFollowUpDate),
      scheduledFirstFollowUpDate: normalizeDateOnly(lead.scheduledFirstFollowUpDate),
      scheduledFirstFollowUpTouchpointId: Number.isInteger(lead.scheduledFirstFollowUpTouchpointId)
        ? lead.scheduledFirstFollowUpTouchpointId
        : undefined,
      followUpDelayDays: Number.isInteger(lead.followUpDelayDays) && (lead.followUpDelayDays ?? 0) >= 1 && (lead.followUpDelayDays ?? 0) <= 365
        ? lead.followUpDelayDays
        : undefined,
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
    ? (record.leadTouchpoints as LeadTouchpoint[]).map((touchpoint) => {
        const separated = separateResponseFromStatus(
          touchpoint.status,
          touchpoint.responseStatus,
        );
        return {
          ...touchpoint,
          channel: isLeadChannel(touchpoint.channel)
            ? touchpoint.channel
            : LEGACY_LEAD_CHANNEL,
          type: touchpoint.type?.trim() || "Other",
          status: separated.status,
          responseStatus: separated.responseStatus,
          templateId: normalizeTemplateRef(touchpoint.templateId),
          context: touchpoint.context ?? "",
          purpose: touchpoint.purpose ?? "",
        };
      })
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

  const listSettings = (
    Array.isArray(record.listSettings) && record.listSettings.length > 0
      ? (record.listSettings as JobSearchListSettings[])
      : [createDefaultListSettings()]
  ).map(withResponseStatusDefaults);
  const weeklyTargetSettings =
    Array.isArray(record.weeklyTargetSettings) &&
    record.weeklyTargetSettings.length > 0
      ? (record.weeklyTargetSettings as WeeklyTargetSettings[])
      : [createDefaultWeeklyTargetSettings()];

  return {
    version: 8,
    companies: arrays.companies as Company[],
    leads: leadsWithStatus,
    applications: arrays.applications as Application[],
    leadTouchpoints: migratedTouchpoints,
    templates,
    achievements,
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
    weeklyTargetSettings,
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
      db.achievements,
      db.activityLogs,
      db.productOutreachContacts,
      db.productOutreachInteractions,
      db.listSettings,
      db.weeklyTargetSettings,
    ],
    async () => {
      await Promise.all([
        db.companies.clear(),
        db.leads.clear(),
        db.applications.clear(),
        db.leadTouchpoints.clear(),
        db.templates.clear(),
        db.achievements.clear(),
        db.activityLogs.clear(),
        db.productOutreachContacts.clear(),
        db.productOutreachInteractions.clear(),
        db.listSettings.clear(),
        db.weeklyTargetSettings.clear(),
      ]);

      await Promise.all([
        db.companies.bulkPut(payload.companies),
        db.leads.bulkPut(payload.leads),
        db.applications.bulkPut(payload.applications),
        db.leadTouchpoints.bulkPut(payload.leadTouchpoints),
        db.templates.bulkPut(payload.templates),
        db.achievements.bulkPut(payload.achievements),
        db.activityLogs.bulkPut(payload.activityLogs),
        db.productOutreachContacts.bulkPut(payload.productOutreachContacts),
        db.productOutreachInteractions.bulkPut(
          payload.productOutreachInteractions,
        ),
        db.listSettings.bulkPut(payload.listSettings),
        db.weeklyTargetSettings.bulkPut(payload.weeklyTargetSettings),
      ]);
    },
  );
}
