import {
  DEFAULT_CONTACTED_LEAD_STATUS,
  DEFAULT_CONTACTED_TRIGGER_STATUSES,
  DEFAULT_LEAD_STATUSES,
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_RESPONSE_STATUSES,
  DEFAULT_TOUCHPOINT_STATUSES,
  DEFAULT_TOUCHPOINT_TYPES,
  LEGACY_REPLIED_TOUCHPOINT_STATUS,
  LIST_SETTINGS_ID,
  type ListSettingsField,
} from "../constants";
import { getDB } from "../db";
import type { JobSearchListSettings } from "../types";

export function createDefaultListSettings(): JobSearchListSettings {
  return {
    id: LIST_SETTINGS_ID,
    leadStatuses: [...DEFAULT_LEAD_STATUSES],
    newLeadStatus: DEFAULT_NEW_LEAD_STATUS,
    contactedLeadStatus: DEFAULT_CONTACTED_LEAD_STATUS,
    touchpointStatuses: [...DEFAULT_TOUCHPOINT_STATUSES],
    responseStatuses: [...DEFAULT_RESPONSE_STATUSES],
    touchpointTypes: [...DEFAULT_TOUCHPOINT_TYPES],
    contactedTriggerStatuses: [...DEFAULT_CONTACTED_TRIGGER_STATUSES],
  };
}

export function withResponseStatusDefaults(
  settings: JobSearchListSettings,
): JobSearchListSettings {
  if (settings.responseStatuses?.length) {
    return {
      ...settings,
      responseStatuses: dedupeStrings(settings.responseStatuses),
    };
  }

  const touchpointStatuses = dedupeStrings(
    settings.touchpointStatuses.filter(
      (status) => status !== LEGACY_REPLIED_TOUCHPOINT_STATUS,
    ),
  );
  const contactedTriggerStatuses = dedupeStrings(
    settings.contactedTriggerStatuses.filter(
      (status) => status !== LEGACY_REPLIED_TOUCHPOINT_STATUS,
    ),
  );

  return {
    ...settings,
    touchpointStatuses: touchpointStatuses.length
      ? touchpointStatuses
      : [...DEFAULT_TOUCHPOINT_STATUSES],
    contactedTriggerStatuses: contactedTriggerStatuses.length
      ? contactedTriggerStatuses
      : [...DEFAULT_CONTACTED_TRIGGER_STATUSES],
    responseStatuses: [...DEFAULT_RESPONSE_STATUSES],
  };
}

export async function getListSettings(): Promise<JobSearchListSettings> {
  const database = getDB();
  const existing = await database.listSettings.get(LIST_SETTINGS_ID);
  if (!existing) {
    const defaults = createDefaultListSettings();
    await database.listSettings.put(defaults);
    return defaults;
  }

  const normalized = withResponseStatusDefaults(existing);
  if (!existing.responseStatuses?.length) {
    await database.listSettings.put(normalized);
  }
  return normalized;
}

export async function saveListSettings(
  settings: JobSearchListSettings,
): Promise<JobSearchListSettings> {
  const database = getDB();
  const normalized: JobSearchListSettings = {
    id: LIST_SETTINGS_ID,
    leadStatuses: dedupeStrings(settings.leadStatuses),
    newLeadStatus: settings.newLeadStatus.trim() || DEFAULT_NEW_LEAD_STATUS,
    contactedLeadStatus:
      settings.contactedLeadStatus.trim() || DEFAULT_CONTACTED_LEAD_STATUS,
    touchpointStatuses: dedupeStrings(settings.touchpointStatuses),
    responseStatuses: dedupeStrings(
      settings.responseStatuses?.length
        ? settings.responseStatuses
        : DEFAULT_RESPONSE_STATUSES,
    ),
    touchpointTypes: dedupeStrings(settings.touchpointTypes),
    contactedTriggerStatuses: dedupeStrings(settings.contactedTriggerStatuses),
  };

  if (!normalized.leadStatuses.includes(normalized.newLeadStatus)) {
    normalized.leadStatuses = dedupeStrings([
      ...normalized.leadStatuses,
      normalized.newLeadStatus,
    ]);
  }
  if (!normalized.leadStatuses.includes(normalized.contactedLeadStatus)) {
    normalized.leadStatuses = dedupeStrings([
      ...normalized.leadStatuses,
      normalized.contactedLeadStatus,
    ]);
  }

  await database.listSettings.put(normalized);
  return normalized;
}

export async function ensureListOption(
  field: ListSettingsField,
  value: string,
): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) return;

  const settings = await getListSettings();
  const list = settings[field];
  if (list.includes(trimmed)) return;

  await saveListSettings({
    ...settings,
    [field]: dedupeStrings([...list, trimmed]),
  });
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}
