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

    this.version(4)
      .stores({
        projects: "id",
        questions: "id, projectId, parentId",
        answers: "id, questionId, projectId",
      })
      .upgrade(async (tx) => {
        const questions = await tx.table("questions").toArray();
        const byParent = new Map<string | null, Question[]>();

        for (const question of questions) {
          const parentId = question.parentId ?? null;
          const siblings = byParent.get(parentId) ?? [];
          siblings.push(question);
          byParent.set(parentId, siblings);
        }

        for (const siblings of byParent.values()) {
          siblings.sort((a, b) => b.createdAt - a.createdAt);
          await Promise.all(
            siblings.map((question, index) =>
              tx.table("questions").update(question.id, { sortOrder: index }),
            ),
          );
        }
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
