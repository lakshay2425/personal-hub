import type { Question, QuestionStatus } from "../types";
import { deleteAnswersByQuestion } from "./answersRepository";
import { getDB } from "./db";

export async function createQuestion(
  questionText: string,
  projectId: string | null = null,
): Promise<Question> {
  const db = await getDB();
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

  await db.add("questions", question);
  return question;
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDB();
  const questions = await db.getAll("questions");
  return questions
    .map(normalizeQuestion)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getJournalQuestions(): Promise<Question[]> {
  const db = await getDB();
  const questions = await db.getAll("questions");
  return questions
    .map(normalizeQuestion)
    .filter((question) => question.projectId === null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getQuestionsByProjectId(
  projectId: string,
): Promise<Question[]> {
  const db = await getDB();
  const questions = await db.getAllFromIndex(
    "questions",
    "projectId",
    projectId,
  );
  return questions
    .map(normalizeQuestion)
    .sort((a, b) => b.createdAt - a.createdAt);
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
    ...normalizeQuestion(existing),
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

  const normalized = normalizeQuestion(existing);
  const newStatus: QuestionStatus =
    normalized.status === "answered" ? "unanswered" : "answered";

  const updated: Question = {
    ...normalized,
    status: newStatus,
    updatedAt: Date.now(),
    answeredAt: newStatus === "answered" ? Date.now() : null,
  };

  await db.put("questions", updated);
  return updated;
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await getDB();
  await deleteAnswersByQuestion(id);
  await db.delete("questions", id);
}

export async function deleteQuestionsByProject(
  projectId: string,
): Promise<void> {
  const db = await getDB();
  const questions = await db.getAllFromIndex(
    "questions",
    "projectId",
    projectId,
  );
  await Promise.all(questions.map((question) => db.delete("questions", question.id)));
}

function normalizeQuestion(
  question: Question & { projectId?: string | null },
): Question {
  return {
    ...question,
    projectId: question.projectId ?? null,
  };
}
