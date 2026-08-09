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

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const;

function backfillTaskFields(task: Task, allTasks: Task[]): Task {
  const parentId = task.parentId ?? null;
  const depth =
    task.depth ??
    (parentId === null
      ? 0
      : ((allTasks.find((item) => item.id === parentId)?.depth ?? 0) +
          1) as Task["depth"]);

  return {
    ...task,
    parentId,
    depth,
    sortOrder: task.sortOrder ?? 0,
  };
}

function assignTaskSortOrders(tasks: Task[]): Task[] {
  const byGroup = new Map<string, Task[]>();

  for (const task of tasks) {
    const key = `${task.weekStart}\0${task.parentId ?? "root"}`;
    const group = byGroup.get(key) ?? [];
    group.push(task);
    byGroup.set(key, group);
  }

  const sortOrderById = new Map<number, number>();

  for (const group of byGroup.values()) {
    group.sort((a, b) => {
      const priorityDiff =
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });
    group.forEach((task, index) => {
      if (task.id !== undefined) {
        sortOrderById.set(task.id, index);
      }
    });
  }

  return tasks.map((task) => ({
    ...task,
    sortOrder:
      task.sortOrder ??
      (task.id !== undefined ? sortOrderById.get(task.id) ?? 0 : 0),
  }));
}

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
    tasks: Array.isArray(record.tasks)
      ? (record.tasks as Task[]).map((task, index, tasks) =>
          backfillTaskFields(task, tasks),
        )
      : [],
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
  const tasks = assignTaskSortOrders(
    (payload.tasks ?? []).map((task, index, tasks) =>
      backfillTaskFields(task, tasks),
    ),
  );
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
