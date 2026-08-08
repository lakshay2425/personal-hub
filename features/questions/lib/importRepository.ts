import type {
  ContentIdea,
  QuestionHubActivityLog,
} from "@/features/content-ideas/types";
import type { Task } from "@/features/planner/types";
import type {
  ProjectFeature,
  ProjectVersion,
} from "@/features/project-features/types";
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
  features?: ProjectFeature[];
  versions?: ProjectVersion[];
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
    features: Array.isArray(record.features)
      ? (record.features as ProjectFeature[])
      : [],
    versions: Array.isArray(record.versions)
      ? (record.versions as ProjectVersion[])
      : [],
  };
}

export async function importProjectsData(
  payload: ProjectsBackupPayload,
): Promise<void> {
  const db = getDB();
  const tasks = payload.tasks ?? [];
  const features = payload.features ?? [];
  const versions = payload.versions ?? [];

  await db.transaction(
    "rw",
    [
      db.projects,
      db.questions,
      db.answers,
      db.contentIdeas,
      db.activityLogs,
      db.tasks,
      db.features,
      db.versions,
    ],
    async () => {
      await Promise.all([
        db.projects.clear(),
        db.questions.clear(),
        db.answers.clear(),
        db.contentIdeas.clear(),
        db.activityLogs.clear(),
        db.tasks.clear(),
        db.features.clear(),
        db.versions.clear(),
      ]);

      await Promise.all([
        db.projects.bulkPut(payload.projects),
        db.questions.bulkPut(payload.questions),
        db.answers.bulkPut(payload.answers),
        db.contentIdeas.bulkPut(payload.contentIdeas),
        db.activityLogs.bulkPut(payload.activityLogs),
        db.tasks.bulkPut(tasks),
        db.features.bulkPut(features),
        db.versions.bulkPut(versions),
      ]);
    },
  );
}
