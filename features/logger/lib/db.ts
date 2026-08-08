import Dexie, { type EntityTable } from "dexie";

import type { LogEntry } from "../types";

class LoggerDatabase extends Dexie {
  logEntries!: EntityTable<LogEntry, "id">;

  constructor() {
    super("logger-db");

    this.version(1).stores({
      logEntries: "id, date",
    });

    this.version(2)
      .stores({
        logEntries: "id, date",
      })
      .upgrade(async (tx) => {
        await tx.table("logEntries").toCollection().modify((entry: LogEntry) => {
          if (entry.source === undefined) {
            delete entry.source;
          }
        });
      });
  }
}

export const db =
  typeof window !== "undefined"
    ? new LoggerDatabase()
    : (null as unknown as LoggerDatabase);

export function getDB(): LoggerDatabase {
  if (!db) {
    throw new Error("IndexedDB is only available in the browser");
  }
  return db;
}
