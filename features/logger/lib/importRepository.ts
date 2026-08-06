import { assertBackupShape } from "@/lib/export/validateBackup";

import { getDB } from "./db";
import type { LogEntry } from "../types";

const REQUIRED_ARRAYS = ["logEntries"] as const;

export type LoggerBackupPayload = {
  version: 1;
  logEntries: LogEntry[];
};

export function validateLoggerBackup(data: unknown): LoggerBackupPayload {
  const arrays = assertBackupShape(data, [...REQUIRED_ARRAYS]);

  return {
    version: 1,
    logEntries: arrays.logEntries as LogEntry[],
  };
}

export async function importLoggerData(
  payload: LoggerBackupPayload,
): Promise<void> {
  const db = getDB();

  await db.transaction("rw", db.logEntries, async () => {
    await db.logEntries.clear();
    await db.logEntries.bulkPut(payload.logEntries);
  });
}
