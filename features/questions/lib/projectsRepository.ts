import {
  deleteContentIdeasByProjectId,
  orphanContentIdeasByProjectId,
} from "@/features/content-ideas/lib/contentIdeasRepository";

import type { Project } from "../types";
import { getDB } from "./db";

export type DeleteProjectOptions = {
  deleteContentIdeas?: boolean;
};

export async function createProject(input: {
  name: string;
  description?: string | null;
}): Promise<Project> {
  const db = getDB();
  const now = Date.now();
  const project: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.projects.add(project);
  return project;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = getDB();
  const projects = await db.projects.toArray();
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const db = getDB();
  return db.projects.get(id);
}

export async function updateProject(
  id: string,
  input: { name: string; description?: string | null },
): Promise<Project> {
  const db = getDB();
  const existing = await db.projects.get(id);

  if (!existing) {
    throw new Error("Project not found");
  }

  const updated: Project = {
    ...existing,
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    updatedAt: Date.now(),
  };

  await db.projects.put(updated);
  return updated;
}

export async function deleteProject(
  id: string,
  options: DeleteProjectOptions = {},
): Promise<void> {
  const db = getDB();

  if (options.deleteContentIdeas) {
    await deleteContentIdeasByProjectId(id);
  } else {
    await orphanContentIdeasByProjectId(id);
  }

  await db.transaction("rw", [db.projects, db.questions, db.answers], async () => {
    const questions = await db.questions.where("projectId").equals(id).toArray();

    for (const question of questions) {
      await db.answers.where("questionId").equals(question.id).delete();
    }

    await db.questions.where("projectId").equals(id).delete();
    await db.answers.where("projectId").equals(id).delete();
    await db.projects.delete(id);
  });
}
