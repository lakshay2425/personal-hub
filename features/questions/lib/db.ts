import Dexie, { type EntityTable } from "dexie";

import type { Answer, Project, Question } from "../types";

class QuestionHubDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
  questions!: EntityTable<Question, "id">;
  answers!: EntityTable<Answer, "id">;

  constructor() {
    super("question-hub-db");

    this.version(2).stores({
      projects: "id",
      questions: "id, projectId",
      answers: "id, questionId, projectId",
    });
  }
}

export const db =
  typeof window !== "undefined"
    ? new QuestionHubDatabase()
    : (null as unknown as QuestionHubDatabase);

export function getDB(): QuestionHubDatabase {
  if (!db) {
    throw new Error("IndexedDB is only available in the browser");
  }
  return db;
}
