import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { Question } from "../types";

interface QuestionHubDB extends DBSchema {
  questions: {
    key: string;
    value: Question;
  };
}

const DB_NAME = "question-hub-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<QuestionHubDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<QuestionHubDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser"),
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<QuestionHubDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("questions")) {
          db.createObjectStore("questions", { keyPath: "id" });
        }
      },
    });
  }

  return dbPromise;
}
