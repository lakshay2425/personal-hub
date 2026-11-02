import { getLoggerDB } from "@/features/logger/lib/db";
import { getDB } from "@/features/questions/lib/db";

import {
  DEFAULT_PRIORITY_SLOTS,
  UNASSIGNED,
  type PrioritiesSettings,
  type PriorityArea,
} from "../types";
import {
  getActivePriorities as getActivePrioritiesFromSlots,
  getPriorityColor as getPriorityColorFromSlots,
  validatePrioritySlots,
} from "./priorityUtils";

const PRIORITIES_KEY = "priorities";

export async function getPriorities(): Promise<PrioritiesSettings> {
  const db = getDB();
  const existing = await db.settings.get(PRIORITIES_KEY);

  if (existing) {
    return existing;
  }

  const defaults: PrioritiesSettings = {
    key: PRIORITIES_KEY,
    slots: [...DEFAULT_PRIORITY_SLOTS],
  };

  await db.settings.put(defaults);
  return defaults;
}

export async function savePriorities(
  slots: (PriorityArea | null)[],
): Promise<PrioritiesSettings> {
  const normalized = slots.map((slot) => {
    if (!slot || slot.name.trim() === "") {
      return null;
    }
    return { name: slot.name.trim(), color: slot.color };
  });

  validatePrioritySlots(normalized);

  const settings: PrioritiesSettings = {
    key: PRIORITIES_KEY,
    slots: normalized,
  };

  const db = getDB();
  await db.settings.put(settings);
  return settings;
}

async function migrateCategoryInLogEntries(
  fromCategory: string,
  toCategory: string,
): Promise<void> {
  const loggerDb = getLoggerDB();
  await loggerDb.logEntries
    .filter((entry) => entry.category === fromCategory)
    .modify({ category: toCategory });
}

export async function renamePriority(
  oldName: string,
  newName: string,
): Promise<void> {
  const trimmedNew = newName.trim();
  if (!trimmedNew) {
    throw new Error("Priority name cannot be empty");
  }

  const settings = await getPriorities();
  const slotIndex = settings.slots.findIndex(
    (slot) => slot?.name === oldName,
  );

  if (slotIndex === -1) {
    throw new Error("Priority not found");
  }

  const duplicate = settings.slots.some(
    (slot, index) =>
      index !== slotIndex &&
      slot !== null &&
      slot.name.toLowerCase() === trimmedNew.toLowerCase(),
  );

  if (duplicate) {
    throw new Error("A priority with that name already exists");
  }

  const updatedSlots = [...settings.slots];
  const slot = updatedSlots[slotIndex];
  if (!slot) {
    throw new Error("Priority not found");
  }
  updatedSlots[slotIndex] = { ...slot, name: trimmedNew };

  await savePriorities(updatedSlots);
  await migrateCategoryInLogEntries(oldName, trimmedNew);
}

export async function deletePriority(name: string): Promise<void> {
  const settings = await getPriorities();
  const updatedSlots = settings.slots.map((slot) =>
    slot?.name === name ? null : slot,
  );

  await migrateCategoryInLogEntries(name, UNASSIGNED);
  await savePriorities(updatedSlots);
}

export function getActivePriorities(
  settings: PrioritiesSettings,
): ReturnType<typeof getActivePrioritiesFromSlots> {
  return getActivePrioritiesFromSlots(settings.slots);
}

export function getPriorityColor(
  settings: PrioritiesSettings,
  category: string,
): string | null {
  return getPriorityColorFromSlots(settings.slots, category, UNASSIGNED);
}
