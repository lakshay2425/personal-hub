import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { LogEntry } from "../types";

interface LoggerDB extends DBSchema {
  logEntries: {
    key: string;
    value: LogEntry;
    indexes: { date: string };
  };
}

const DB_NAME = "logger-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LoggerDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<LoggerDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser"),
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<LoggerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("logEntries")) {
          const store = db.createObjectStore("logEntries", { keyPath: "id" });
          store.createIndex("date", "date");
        }
      },
    });
  }

  return dbPromise;
}
