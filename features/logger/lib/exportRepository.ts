import { getDB } from "./db";

export async function exportLoggerData() {
  const db = getDB();
  const logEntries = await db.logEntries.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    logEntries,
  };
}
