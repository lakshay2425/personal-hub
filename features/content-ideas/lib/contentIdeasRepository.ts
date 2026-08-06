import { getDB } from "@/features/questions/lib/db";

import type { ContentIdea, ContentIdeaStatus, PublishedLinks } from "../types";
import { EMPTY_PUBLISHED_LINKS } from "../types";
import {
  logContentIdeaActivity,
} from "./activityLog";

export type ContentIdeaInput = {
  projectId: string | null;
  title: string;
  status: ContentIdeaStatus;
  publishedLinks: PublishedLinks;
  notes: string;
};

function normalizePublishedLinks(links: PublishedLinks): PublishedLinks {
  return {
    linkedin: links.linkedin.trim(),
    twitter: links.twitter.trim(),
    blog: links.blog.trim(),
    other: links.other.trim(),
  };
}

export async function getStandaloneContentIdeas(): Promise<ContentIdea[]> {
  const db = getDB();
  const ideas = await db.contentIdeas.toArray();
  return ideas
    .filter((idea) => idea.projectId === null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getContentIdeasByProjectId(
  projectId: string,
): Promise<ContentIdea[]> {
  const db = getDB();
  return db.contentIdeas
    .where("projectId")
    .equals(projectId)
    .reverse()
    .sortBy("createdAt");
}

export async function countContentIdeasByProjectId(
  projectId: string,
): Promise<number> {
  const db = getDB();
  return db.contentIdeas.where("projectId").equals(projectId).count();
}

export async function createContentIdea(
  input: ContentIdeaInput,
): Promise<number> {
  const db = getDB();
  const id = await db.contentIdeas.add({
    projectId: input.projectId,
    title: input.title.trim(),
    status: input.status,
    publishedLinks: normalizePublishedLinks(
      input.status === "Published" ? input.publishedLinks : EMPTY_PUBLISHED_LINKS,
    ),
    notes: input.notes.trim(),
    createdAt: Date.now(),
  });

  await logContentIdeaActivity(id as number, "Content Idea Created");
  return id as number;
}

export async function updateContentIdea(
  id: number,
  input: ContentIdeaInput,
  previousStatus?: ContentIdeaStatus,
): Promise<void> {
  const db = getDB();
  const existing = await db.contentIdeas.get(id);

  if (!existing) {
    throw new Error("Content idea not found");
  }

  await db.contentIdeas.update(id, {
    projectId: input.projectId,
    title: input.title.trim(),
    status: input.status,
    publishedLinks: normalizePublishedLinks(
      input.status === "Published" ? input.publishedLinks : EMPTY_PUBLISHED_LINKS,
    ),
    notes: input.notes.trim(),
  });

  if (previousStatus && previousStatus !== input.status) {
    await logContentIdeaActivity(id, "Content Idea Status Changed");
  }
}

export async function deleteContentIdea(id: number): Promise<void> {
  const db = getDB();
  await logContentIdeaActivity(id, "Content Idea Deleted");
  await db.contentIdeas.delete(id);
}

export async function deleteContentIdeasByProjectId(
  projectId: string,
): Promise<void> {
  const db = getDB();
  const ideas = await db.contentIdeas.where("projectId").equals(projectId).toArray();

  for (const idea of ideas) {
    if (idea.id !== undefined) {
      await deleteContentIdea(idea.id);
    }
  }
}

export async function orphanContentIdeasByProjectId(
  projectId: string,
): Promise<void> {
  const db = getDB();
  await db.contentIdeas
    .where("projectId")
    .equals(projectId)
    .modify({ projectId: null });
}
