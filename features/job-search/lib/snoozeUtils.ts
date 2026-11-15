import { addDays, format, isValid, parseISO } from "date-fns";

import { getTodayDateString } from "./dateUtils";
import type { Lead, SnoozePreset } from "../types";

export const DEFAULT_SNOOZE_PRESETS: SnoozePreset[] = [
  { label: "1 week", days: 7, isDefault: true },
  { label: "2 weeks", days: 14, isDefault: false },
  { label: "1 month", days: 30, isDefault: false },
];

export function isValidSnoozeDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

export function isLeadSnoozed(
  lead: Pick<Lead, "snoozedUntil">,
  today = getTodayDateString(),
): boolean {
  return Boolean(
    lead.snoozedUntil &&
      isValidSnoozeDate(lead.snoozedUntil) &&
      lead.snoozedUntil > today,
  );
}

export function getSnoozeDate(
  days: number,
  today = getTodayDateString(),
): string {
  if (!Number.isInteger(days) || days < 1 || !isValidSnoozeDate(today)) {
    throw new Error("Snooze duration must be a positive whole number of days.");
  }
  return format(addDays(parseISO(today), days), "yyyy-MM-dd");
}

export function formatSnoozeDate(value: string): string {
  if (!isValidSnoozeDate(value)) {
    throw new Error("Snooze date must be a valid calendar date.");
  }
  return format(parseISO(value), "dd MMM");
}

export function normalizeSnoozePresets(value: unknown): SnoozePreset[] {
  if (!Array.isArray(value)) return [...DEFAULT_SNOOZE_PRESETS];

  const seenLabels = new Set<string>();
  const valid: SnoozePreset[] = [];
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.label !== "string" ||
      !item.label.trim() ||
      typeof item.days !== "number" ||
      !Number.isInteger(item.days) ||
      item.days < 1 ||
      typeof item.isDefault !== "boolean"
    ) {
      continue;
    }

    const label = item.label.trim();
    const normalizedLabel = label.toLocaleLowerCase();
    if (seenLabels.has(normalizedLabel)) continue;
    seenLabels.add(normalizedLabel);
    valid.push({ label, days: item.days, isDefault: item.isDefault });
  }

  if (valid.length === 0) return [...DEFAULT_SNOOZE_PRESETS];

  const defaultIndex = valid.findIndex((preset) => preset.isDefault === true);
  return valid.map((preset, index) => ({
    label: preset.label.trim(),
    days: preset.days,
    isDefault: index === (defaultIndex === -1 ? 0 : defaultIndex),
  }));
}

export function getDefaultSnoozePreset(
  presets: SnoozePreset[],
): SnoozePreset {
  return presets.find((preset) => preset.isDefault) ?? presets[0] ?? DEFAULT_SNOOZE_PRESETS[0];
}
