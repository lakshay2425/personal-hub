import type { Question, QuestionStatus } from "../types";
import { getDB } from "./db";

export async function createQuestion(questionText: string): Promise<Question> {
  const db = await getDB();
  const now = Date.now();

  const question: Question = {
    id: crypto.randomUUID(),
    questionText,
    status: "unanswered",
    createdAt: now,
    updatedAt: now,
    answeredAt: null,
  };

  await db.add("questions", question);
  return question;
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDB();
  const questions = await db.getAll("questions");
  return questions.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateQuestionText(
  id: string,
  questionText: string,
): Promise<Question> {
  const db = await getDB();
  const existing = await db.get("questions", id);

  if (!existing) {
    throw new Error("Question not found");
  }

  const updated: Question = {
    ...existing,
    questionText,
    updatedAt: Date.now(),
  };

  await db.put("questions", updated);
  return updated;
}

export async function toggleQuestionStatus(id: string): Promise<Question> {
  const db = await getDB();
  const existing = await db.get("questions", id);

  if (!existing) {
    throw new Error("Question not found");
  }

  const newStatus: QuestionStatus =
    existing.status === "answered" ? "unanswered" : "answered";

  const updated: Question = {
    ...existing,
    status: newStatus,
    updatedAt: Date.now(),
    answeredAt: newStatus === "answered" ? Date.now() : null,
  };

  await db.put("questions", updated);
  return updated;
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("questions", id);
}
