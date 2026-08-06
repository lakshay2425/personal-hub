import type { Answer } from "../types";
import { getDB } from "./db";

export class DuplicateAnswerTitleError extends Error {
  constructor(title: string) {
    super(`An answer titled "${title}" already exists for this question`);
    this.name = "DuplicateAnswerTitleError";
  }
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

async function assertUniqueTitle(
  questionId: string,
  title: string,
  excludeId?: string,
): Promise<void> {
  const db = getDB();
  const answers = await db.answers
    .where("questionId")
    .equals(questionId)
    .toArray();
  const normalized = normalizeTitle(title);
  const duplicate = answers.find(
    (answer) =>
      normalizeTitle(answer.title) === normalized && answer.id !== excludeId,
  );

  if (duplicate) {
    throw new DuplicateAnswerTitleError(title.trim());
  }
}

export async function listAnswersByQuestion(
  questionId: string,
): Promise<Answer[]> {
  const db = getDB();
  const answers = await db.answers
    .where("questionId")
    .equals(questionId)
    .toArray();
  return answers.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createAnswer(input: {
  projectId: string | null;
  questionId: string;
  title: string;
  body: string;
}): Promise<Answer> {
  await assertUniqueTitle(input.questionId, input.title);

  const db = getDB();
  const now = Date.now();
  const answer: Answer = {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    questionId: input.questionId,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: now,
    updatedAt: now,
  };

  await db.answers.add(answer);
  return answer;
}

export async function updateAnswer(
  id: string,
  input: { title: string; body: string },
): Promise<Answer> {
  const db = getDB();
  const existing = await db.answers.get(id);

  if (!existing) {
    throw new Error("Answer not found");
  }

  await assertUniqueTitle(existing.questionId, input.title, id);

  const updated: Answer = {
    ...existing,
    title: input.title.trim(),
    body: input.body.trim(),
    updatedAt: Date.now(),
  };

  await db.answers.put(updated);
  return updated;
}

export async function deleteAnswer(id: string): Promise<void> {
  const db = getDB();
  await db.answers.delete(id);
}

export async function deleteAnswersByQuestion(questionId: string): Promise<void> {
  const db = getDB();
  await db.answers.where("questionId").equals(questionId).delete();
}

export async function getAnswerCountsByQuestionIds(
  questionIds: string[],
): Promise<Record<string, number>> {
  if (questionIds.length === 0) {
    return {};
  }

  const db = getDB();
  const answers = await db.answers
    .where("questionId")
    .anyOf(questionIds)
    .toArray();
  const counts = Object.fromEntries(questionIds.map((id) => [id, 0]));

  for (const answer of answers) {
    if (counts[answer.questionId] !== undefined) {
      counts[answer.questionId] += 1;
    }
  }

  return counts;
}

export async function deleteAnswersByProject(projectId: string): Promise<void> {
  const db = getDB();
  await db.answers.where("projectId").equals(projectId).delete();
}
