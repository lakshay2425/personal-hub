import type {
  ContentIdea,
  ContentIdeaActivityLog,
} from "@/features/content-ideas/types";
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
  activityLogs: ContentIdeaActivityLog[];
};

export function validateProjectsBackup(data: unknown): ProjectsBackupPayload {
  const arrays = assertBackupShape(data, [...REQUIRED_ARRAYS]);

  return {
    version: 1,
    projects: arrays.projects as Project[],
    questions: arrays.questions as Question[],
    answers: arrays.answers as Answer[],
    contentIdeas: arrays.contentIdeas as ContentIdea[],
    activityLogs: arrays.activityLogs as ContentIdeaActivityLog[],
  };
}

export async function importProjectsData(
  payload: ProjectsBackupPayload,
): Promise<void> {
  const db = getDB();

  await db.transaction(
    "rw",
    [
      db.projects,
      db.questions,
      db.answers,
      db.contentIdeas,
      db.activityLogs,
    ],
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.questions.clear(),
        db.answers.clear(),
        db.contentIdeas.clear(),
        db.activityLogs.clear(),
      ]);

      await Promise.all([
        db.projects.bulkPut(payload.projects),
        db.questions.bulkPut(payload.questions),
        db.answers.bulkPut(payload.answers),
        db.contentIdeas.bulkPut(payload.contentIdeas),
        db.activityLogs.bulkPut(payload.activityLogs),
      ]);
    },
  );
}
