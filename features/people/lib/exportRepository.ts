import { getDB } from "../db";

export async function exportPeopleData() {
  const db = getDB();
  const [discoverPeople, networkPeople] = await Promise.all([
    db.discoverPeople.toArray(),
    db.networkPeople.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    discoverPeople,
    networkPeople,
  };
}
