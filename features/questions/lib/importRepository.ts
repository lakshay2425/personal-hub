import type {
  ContentIdea,
  QuestionHubActivityLog,
} from "@/features/content-ideas/types";
import type { Task } from "@/features/planner/types";
import { assertBackupShape } from "@/lib/export/validateBackup";

import type { Answer, Project, Question } from "../types";
import { getDB } from "./db";

const REQUIRED_ARRAYS = [
  "projects",
  "questions",
  "answers",
  "contentIdeas",
  "activityLogs",
] as const;

export type ProjectsBackupPayload = {
  version: 1;
  projects: Project[];
  questions: Question[];
  answers: Answer[];
  contentIdeas: ContentIdea[];
  activityLogs: QuestionHubActivityLog[];
  tasks?: Task[];
};

export function validateProjectsBackup(data: unknown): ProjectsBackupPayload {
  const arrays = assertBackupShape(data, [...REQUIRED_ARRAYS]);
  const record = data as Record<string, unknown>;

  return {
    version: 1,
    projects: arrays.projects as Project[],
    questions: arrays.questions as Question[],
    answers: arrays.answers as Answer[],
    contentIdeas: (arrays.contentIdeas as ContentIdea[]).map((idea) => ({
      ...idea,
      scheduledDate: idea.scheduledDate ?? null,
    })),
    activityLogs: arrays.activityLogs as QuestionHubActivityLog[],
    tasks: Array.isArray(record.tasks) ? (record.tasks as Task[]) : [],
  };
}

export async function importProjectsData(
  payload: ProjectsBackupPayload,
): Promise<void> {
  const db = getDB();
  const tasks = payload.tasks ?? [];

  await db.transaction(
    "rw",
    [
      db.projects,
      db.questions,
      db.answers,
      db.contentIdeas,
      db.activityLogs,
      db.tasks,
    ],
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.questions.clear(),
        db.answers.clear(),
        db.contentIdeas.clear(),
        db.activityLogs.clear(),
        db.tasks.clear(),
      ]);

      await Promise.all([
        db.projects.bulkPut(payload.projects),
        db.questions.bulkPut(payload.questions),
        db.answers.bulkPut(payload.answers),
        db.contentIdeas.bulkPut(payload.contentIdeas),
        db.activityLogs.bulkPut(payload.activityLogs),
        db.tasks.bulkPut(tasks),
      ]);
    },
  );
}
