import type { Project } from "../types";
import {
  deleteAnswersByProject,
  deleteAnswersByQuestion,
} from "./answersRepository";
import { getDB } from "./db";
import { deleteQuestionsByProject } from "./questionsRepository";

export async function createProject(input: {
  name: string;
  description?: string | null;
}): Promise<Project> {
  const db = await getDB();
  const now = Date.now();
  const project: Project = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.add("projects", project);
  return project;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAll("projects");
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get("projects", id);
}

export async function updateProject(
  id: string,
  input: { name: string; description?: string | null },
): Promise<Project> {
  const db = await getDB();
  const existing = await db.get("projects", id);

  if (!existing) {
    throw new Error("Project not found");
  }

  const updated: Project = {
    ...existing,
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    updatedAt: Date.now(),
  };

  await db.put("projects", updated);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  const questions = await db.getAllFromIndex("questions", "projectId", id);

  for (const question of questions) {
    await deleteAnswersByQuestion(question.id);
  }

  await deleteQuestionsByProject(id);
  await deleteAnswersByProject(id);
  await db.delete("projects", id);
}
