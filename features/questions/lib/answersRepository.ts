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
  const db = await getDB();
  const answers = await db.getAllFromIndex("answers", "questionId", questionId);
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
  const db = await getDB();
  const answers = await db.getAllFromIndex("answers", "questionId", questionId);
  return answers.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createAnswer(input: {
  projectId: string | null;
  questionId: string;
  title: string;
  body: string;
}): Promise<Answer> {
  await assertUniqueTitle(input.questionId, input.title);

  const db = await getDB();
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

  await db.add("answers", answer);
  return answer;
}

export async function updateAnswer(
  id: string,
  input: { title: string; body: string },
): Promise<Answer> {
  const db = await getDB();
  const existing = await db.get("answers", id);

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

  await db.put("answers", updated);
  return updated;
}

export async function deleteAnswer(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("answers", id);
}

export async function deleteAnswersByQuestion(questionId: string): Promise<void> {
  const db = await getDB();
  const answers = await db.getAllFromIndex("answers", "questionId", questionId);
  await Promise.all(answers.map((answer) => db.delete("answers", answer.id)));
}

export async function getAnswerCountsByQuestionIds(
  questionIds: string[],
): Promise<Record<string, number>> {
  if (questionIds.length === 0) {
    return {};
  }

  const db = await getDB();
  const allAnswers = await db.getAll("answers");
  const counts = Object.fromEntries(questionIds.map((id) => [id, 0]));

  for (const answer of allAnswers) {
    if (counts[answer.questionId] !== undefined) {
      counts[answer.questionId] += 1;
    }
  }

  return counts;
}

export async function deleteAnswersByProject(projectId: string): Promise<void> {
  const db = await getDB();
  const answers = await db.getAllFromIndex("answers", "projectId", projectId);
  await Promise.all(answers.map((answer) => db.delete("answers", answer.id)));
}
