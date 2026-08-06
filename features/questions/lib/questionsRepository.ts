import type { Question, QuestionStatus } from "../types";
import { deleteAnswersByQuestion } from "./answersRepository";
import { getDB } from "./db";

export async function createQuestion(
  questionText: string,
  projectId: string | null = null,
): Promise<Question> {
  const db = getDB();
  const now = Date.now();

  const question: Question = {
    id: crypto.randomUUID(),
    projectId,
    questionText,
    status: "unanswered",
    createdAt: now,
    updatedAt: now,
    answeredAt: null,
  };

  await db.questions.add(question);
  return question;
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = getDB();
  const questions = await db.questions.toArray();
  return questions.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getJournalQuestions(): Promise<Question[]> {
  const db = getDB();
  const questions = await db.questions.toArray();
  return questions
    .filter((question) => question.projectId === null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getQuestionsByProjectId(
  projectId: string,
): Promise<Question[]> {
  const db = getDB();
  const questions = await db.questions
    .where("projectId")
    .equals(projectId)
    .toArray();
  return questions.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateQuestionText(
  id: string,
  questionText: string,
): Promise<Question> {
  const db = getDB();
  const existing = await db.questions.get(id);

  if (!existing) {
    throw new Error("Question not found");
  }

  const updated: Question = {
    ...existing,
    questionText,
    updatedAt: Date.now(),
  };

  await db.questions.put(updated);
  return updated;
}

export async function toggleQuestionStatus(id: string): Promise<Question> {
  const db = getDB();
  const existing = await db.questions.get(id);

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

  await db.questions.put(updated);
  return updated;
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = getDB();
  await deleteAnswersByQuestion(id);
  await db.questions.delete(id);
}

export async function deleteQuestionsByProject(
  projectId: string,
): Promise<void> {
  const db = getDB();
  await db.questions.where("projectId").equals(projectId).delete();
}
