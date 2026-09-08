import { getDB } from "../db";
import { normalizeNetworkPerson, sortNetworkPeople } from "../lib/networkUtils";
import type { NetworkPerson, NetworkPersonInput } from "../types";

export async function getAllNetworkPeople(): Promise<NetworkPerson[]> {
  const people = await getDB().networkPeople.toArray();
  return sortNetworkPeople(people.filter((person) => Boolean(person.id)));
}

export async function createNetworkPerson(
  data: NetworkPersonInput,
): Promise<number> {
  const now = Date.now();
  const normalized = normalizeNetworkPerson(data);

  return getDB().networkPeople.add({
    ...normalized,
    createdAt: now,
    updatedAt: now,
  }) as Promise<number>;
}

export async function updateNetworkPerson(
  id: number,
  data: Partial<NetworkPersonInput>,
): Promise<void> {
  const existing = await getDB().networkPeople.get(id);
  if (!existing) {
    throw new Error("Network person not found");
  }

  const normalized = normalizeNetworkPerson({
    name: data.name ?? existing.name,
    platform: data.platform ?? existing.platform,
    profileUrl: data.profileUrl ?? existing.profileUrl,
    relationshipType: data.relationshipType ?? existing.relationshipType,
    howWeKnow: data.howWeKnow ?? existing.howWeKnow,
    metAt: data.metAt ?? existing.metAt,
    notes: data.notes ?? existing.notes,
  });

  await getDB().networkPeople.update(id, {
    ...normalized,
    updatedAt: Date.now(),
  });
}

export async function deleteNetworkPerson(id: number): Promise<void> {
  await getDB().networkPeople.delete(id);
}
