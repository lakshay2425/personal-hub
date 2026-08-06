import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction } from "idb";

import type { Answer, Project, Question } from "../types";

interface QuestionHubDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  questions: {
    key: string;
    value: Question;
    indexes: { projectId: string };
  };
  answers: {
    key: string;
    value: Answer;
    indexes: { questionId: string; projectId: string };
  };
}

const DB_NAME = "question-hub-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<QuestionHubDB>> | null = null;

async function migrateQuestionsProjectId(
  transaction: IDBPTransaction<
    QuestionHubDB,
    Array<"projects" | "questions" | "answers">,
    "versionchange"
  >,
): Promise<void> {
  const store = transaction.objectStore("questions");
  let cursor = await store.openCursor();

  while (cursor) {
    const question = cursor.value as Question & { projectId?: string | null };
    if (question.projectId === undefined) {
      await cursor.update({ ...question, projectId: null });
    }
    cursor = await cursor.continue();
  }
}

export function getDB(): Promise<IDBPDatabase<QuestionHubDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser"),
    );
  }

  if (!dbPromise) {
    dbPromise = openDB<QuestionHubDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains("questions")) {
          const questionStore = db.createObjectStore("questions", {
            keyPath: "id",
          });
          questionStore.createIndex("projectId", "projectId");
        } else if (oldVersion < 2) {
          const questionStore = transaction.objectStore("questions");
          if (!questionStore.indexNames.contains("projectId")) {
            questionStore.createIndex("projectId", "projectId");
          }
        }

        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("answers")) {
          const answerStore = db.createObjectStore("answers", { keyPath: "id" });
          answerStore.createIndex("questionId", "questionId");
          answerStore.createIndex("projectId", "projectId");
        }

        if (oldVersion < 2 && db.objectStoreNames.contains("questions")) {
          return migrateQuestionsProjectId(transaction);
        }
      },
    });
  }

  return dbPromise;
}
