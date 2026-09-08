import { assertBackupShape } from "@/lib/export/validateBackup";

import { getDB } from "../db";
import type { DiscoverPerson, NetworkPerson } from "../types";

const REQUIRED_ARRAYS = ["discoverPeople", "networkPeople"] as const;

export type PeopleBackupPayload = {
  version: 1;
  discoverPeople: DiscoverPerson[];
  networkPeople: NetworkPerson[];
};

export function validatePeopleBackup(data: unknown): PeopleBackupPayload {
  const arrays = assertBackupShape(data, [...REQUIRED_ARRAYS]);

  return {
    version: 1,
    discoverPeople: arrays.discoverPeople as DiscoverPerson[],
    networkPeople: arrays.networkPeople as NetworkPerson[],
  };
}

export async function importPeopleData(
  payload: PeopleBackupPayload,
): Promise<void> {
  const db = getDB();

  await db.transaction("rw", db.discoverPeople, db.networkPeople, async () => {
    await db.discoverPeople.clear();
    await db.networkPeople.clear();
    await db.discoverPeople.bulkPut(payload.discoverPeople);
    await db.networkPeople.bulkPut(payload.networkPeople);
  });
}
