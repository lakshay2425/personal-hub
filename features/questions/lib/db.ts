import Dexie, { type EntityTable } from "dexie";

import type { Answer, Project, Question } from "../types";

class QuestionHubDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
  questions!: EntityTable<Question, "id">;
  answers!: EntityTable<Answer, "id">;

  constructor() {
    super("question-hub-db");

    this.version(1).stores({
      projects: "id",
      questions: "id, projectId",
      answers: "id, questionId, projectId",
    });

    this.version(2).stores({
      projects: "id",
      questions: "id, projectId",
      answers: "id, questionId, projectId",
    });

    this.version(3)
      .stores({
        projects: "id",
        questions: "id, projectId, parentId",
        answers: "id, questionId, projectId",
      })
      .upgrade(async (tx) => {
        await tx
          .table("questions")
          .toCollection()
          .modify((question: Question) => {
            if (question.parentId === undefined) {
              question.parentId = null;
            }
            if (question.depth === undefined) {
              question.depth = 0;
            }
          });
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
