import {
  PRIORITY_SLOT_COUNT,
  type PriorityArea,
} from "../types";

export function validatePrioritySlots(slots: (PriorityArea | null)[]): void {
  if (slots.length !== PRIORITY_SLOT_COUNT) {
    throw new Error(`Expected ${PRIORITY_SLOT_COUNT} priority slots`);
  }

  const names = slots
    .filter((slot): slot is PriorityArea => slot !== null && slot.name.trim() !== "")
    .map((slot) => slot.name.trim().toLowerCase());

  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    throw new Error("Priority names must be unique");
  }
}

export function getActivePriorities(
  slots: (PriorityArea | null)[],
): PriorityArea[] {
  return slots.filter(
    (slot): slot is PriorityArea => slot !== null && slot.name.trim() !== "",
  );
}

export function getPriorityColor(
  slots: (PriorityArea | null)[],
  category: string,
  unassignedCategory: string,
): string | null {
  if (category === unassignedCategory) return null;
  return slots.find((slot) => slot?.name === category)?.color ?? null;
}
