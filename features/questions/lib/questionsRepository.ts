import type { Question, QuestionDepth, QuestionStatus } from "../types";
import { deleteAnswersByQuestion } from "./answersRepository";
import { getDB } from "./db";

async function collectDescendantIdsFromDb(
  parentId: string,
): Promise<string[]> {
  const db = getDB();
  const children = await db.questions.where("parentId").equals(parentId).toArray();
  const ids: string[] = [];

  for (const child of children) {
    ids.push(child.id);
    ids.push(...(await collectDescendantIdsFromDb(child.id)));
  }

  return ids;
}

export async function createQuestion(
  questionText: string,
  projectId: string | null = null,
  parentId: string | null = null,
): Promise<Question> {
  const db = getDB();
  const now = Date.now();
  let depth: QuestionDepth = 0;

  if (parentId) {
    const parent = await db.questions.get(parentId);

    if (!parent) {
      throw new Error("Parent question not found");
    }

    if (parent.depth >= 2) {
      throw new Error("Maximum sub-question depth reached");
    }

    depth = (parent.depth + 1) as QuestionDepth;
    projectId = parent.projectId;
  }

  const question: Question = {
    id: crypto.randomUUID(),
    projectId,
    parentId,
    depth,
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

export async function getInboxQuestions(): Promise<Question[]> {
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

export async function countSubQuestions(id: string): Promise<number> {
  const descendantIds = await collectDescendantIdsFromDb(id);
  return descendantIds.length;
}

export async function deleteQuestion(
  id: string,
): Promise<{ deletedSubCount: number }> {
  const db = getDB();
  const descendantIds = await collectDescendantIdsFromDb(id);
  const allIds = [...descendantIds, id];

  await db.transaction("rw", [db.questions, db.answers], async () => {
    for (const questionId of allIds) {
      await deleteAnswersByQuestion(questionId);
    }
    await db.questions.bulkDelete(allIds);
  });

  return { deletedSubCount: descendantIds.length };
}

export async function deleteQuestionsByProject(
  projectId: string,
): Promise<void> {
  const db = getDB();
  await db.questions.where("projectId").equals(projectId).delete();
}

export async function moveQuestionToProject(
  questionId: string,
  projectId: string,
): Promise<Question> {
  const db = getDB();
  const existing = await db.questions.get(questionId);

  if (!existing) {
    throw new Error("Question not found");
  }

  const descendantIds = await collectDescendantIdsFromDb(questionId);
  const allQuestionIds = [questionId, ...descendantIds];

  await db.transaction("rw", [db.questions, db.answers], async () => {
    for (const id of allQuestionIds) {
      const question = await db.questions.get(id);
      if (!question) continue;

      const updated: Question = {
        ...question,
        projectId,
        updatedAt: Date.now(),
      };
      await db.questions.put(updated);

      const answers = await db.answers
        .where("questionId")
        .equals(id)
        .toArray();
      await Promise.all(
        answers.map((answer) =>
          db.answers.put({
            ...answer,
            projectId,
            updatedAt: Date.now(),
          }),
        ),
      );
    }
  });

  const updated = await db.questions.get(questionId);
  if (!updated) {
    throw new Error("Question not found");
  }

  return updated;
}
