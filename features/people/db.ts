import Dexie, { type EntityTable } from "dexie";

import type { DiscoverPerson, NetworkPerson } from "./types";

class PeopleDatabase extends Dexie {
  discoverPeople!: EntityTable<DiscoverPerson, "id">;
  networkPeople!: EntityTable<NetworkPerson, "id">;

  constructor() {
    super("people-db");

    this.version(1).stores({
      discoverPeople:
        "++id, name, platform, status, createdAt, updatedAt, reviewedAt",
      networkPeople:
        "++id, name, platform, relationshipType, createdAt, updatedAt",
    });
  }
}

export const db =
  typeof window !== "undefined"
    ? new PeopleDatabase()
    : (null as unknown as PeopleDatabase);

export function getDB(): PeopleDatabase {
  if (!db) {
    throw new Error("IndexedDB is only available in the browser");
  }
  return db;
}
