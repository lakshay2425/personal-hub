import { getDB } from "../db";
import {
  normalizeDiscoverPerson,
  reviewedAtForStatus,
  sortDiscoverPeople,
} from "../lib/discoverUtils";
import type { DiscoverPerson, DiscoverPersonInput, DiscoverStatus } from "../types";

export async function getAllDiscoverPeople(): Promise<DiscoverPerson[]> {
  const people = await getDB().discoverPeople.toArray();
  return sortDiscoverPeople(people.filter((person) => Boolean(person.id)));
}

export async function createDiscoverPerson(
  data: DiscoverPersonInput,
): Promise<number> {
  const now = Date.now();
  const normalized = normalizeDiscoverPerson(data);

  return getDB().discoverPeople.add({
    ...normalized,
    reviewedAt: reviewedAtForStatus(normalized.status),
    createdAt: now,
    updatedAt: now,
  }) as Promise<number>;
}

export async function updateDiscoverPerson(
  id: number,
  data: Partial<DiscoverPersonInput>,
): Promise<void> {
  const existing = await getDB().discoverPeople.get(id);
  if (!existing) {
    throw new Error("Discover person not found");
  }

  const normalized = normalizeDiscoverPerson({
    name: data.name ?? existing.name,
    platform: data.platform ?? existing.platform,
    profileUrl: data.profileUrl ?? existing.profileUrl,
    whySaved: data.whySaved ?? existing.whySaved,
    status: data.status ?? existing.status,
    notes: data.notes ?? existing.notes,
  });

  const statusChanged = normalized.status !== existing.status;

  await getDB().discoverPeople.update(id, {
    ...normalized,
    reviewedAt: statusChanged
      ? reviewedAtForStatus(normalized.status)
      : existing.reviewedAt,
    updatedAt: Date.now(),
  });
}

export async function updateDiscoverPersonStatus(
  id: number,
  status: DiscoverStatus,
): Promise<void> {
  await updateDiscoverPerson(id, { status });
}

export async function deleteDiscoverPerson(id: number): Promise<void> {
  await getDB().discoverPeople.delete(id);
}
