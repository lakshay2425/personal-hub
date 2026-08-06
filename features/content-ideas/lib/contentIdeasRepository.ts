import { getDB } from "@/features/questions/lib/db";

import type {
  ContentIdea,
  ContentIdeaDepth,
  ContentIdeaStatus,
  PublishedLinks,
} from "../types";
import { EMPTY_PUBLISHED_LINKS } from "../types";
import {
  canMoveToRoot,
  collectDescendantIds,
  compareContentIdeas,
  getMaxDepthInSubtree,
  getValidParentTargets,
  isDescendantOf,
} from "./contentIdeaTree";
import { logContentIdeaActivity } from "./activityLog";

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

async function collectDescendantIdsFromDb(parentId: number): Promise<number[]> {
  const db = getDB();
  const children = await db.contentIdeas
    .where("parentId")
    .equals(parentId)
    .toArray();
  const ids: number[] = [];

  for (const child of children) {
    if (child.id !== undefined) {
      ids.push(child.id);
      ids.push(...(await collectDescendantIdsFromDb(child.id)));
    }
  }

  return ids;
}

async function getNextSortOrder(
  parentId: number | null,
  projectId: string | null,
): Promise<number> {
  const db = getDB();
  const all = await db.contentIdeas.toArray();
  const siblings = all.filter(
    (idea) =>
      idea.parentId === parentId &&
      (parentId !== null || idea.projectId === projectId),
  );

  if (siblings.length === 0) {
    return 0;
  }

  return Math.min(...siblings.map((idea) => idea.sortOrder ?? 0)) - 1;
}

export async function getStandaloneContentIdeas(): Promise<ContentIdea[]> {
  const db = getDB();
  const ideas = await db.contentIdeas.toArray();
  return ideas
    .filter((idea) => idea.projectId === null)
    .sort(compareContentIdeas);
}

export async function getContentIdeasByProjectId(
  projectId: string,
): Promise<ContentIdea[]> {
  const db = getDB();
  const ideas = await db.contentIdeas
    .where("projectId")
    .equals(projectId)
    .toArray();
  return ideas.sort(compareContentIdeas);
}

export async function countContentIdeasByProjectId(
  projectId: string,
): Promise<number> {
  const db = getDB();
  return db.contentIdeas.where("projectId").equals(projectId).count();
}

export async function createContentIdea(
  input: ContentIdeaInput,
  parentId: number | null = null,
): Promise<ContentIdea> {
  const db = getDB();
  let projectId = input.projectId;
  let depth: ContentIdeaDepth = 0;

  if (parentId) {
    const parent = await db.contentIdeas.get(parentId);

    if (!parent) {
      throw new Error("Parent content idea not found");
    }

    if (parent.depth >= 2) {
      throw new Error("Maximum sub-idea depth reached");
    }

    depth = (parent.depth + 1) as ContentIdeaDepth;
    projectId = parent.projectId;
  }

  const sortOrder = await getNextSortOrder(parentId, projectId);
  const createdAt = Date.now();

  const id = await db.contentIdeas.add({
    projectId,
    parentId,
    depth,
    sortOrder,
    title: input.title.trim(),
    status: input.status,
    publishedLinks: normalizePublishedLinks(
      input.status === "Published" ? input.publishedLinks : EMPTY_PUBLISHED_LINKS,
    ),
    notes: input.notes.trim(),
    createdAt,
  });

  await logContentIdeaActivity(id as number, "Content Idea Created");

  return {
    id: id as number,
    projectId,
    parentId,
    depth,
    sortOrder,
    title: input.title.trim(),
    status: input.status,
    publishedLinks: normalizePublishedLinks(
      input.status === "Published" ? input.publishedLinks : EMPTY_PUBLISHED_LINKS,
    ),
    notes: input.notes.trim(),
    createdAt,
  };
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

export async function reorderContentIdeas(
  parentId: number | null,
  orderedIds: number[],
): Promise<ContentIdea[]> {
  const db = getDB();

  await db.transaction("rw", db.contentIdeas, async () => {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.contentIdeas.update(id, { sortOrder: index }),
      ),
    );
  });

  const updated = await Promise.all(orderedIds.map((id) => db.contentIdeas.get(id)));
  return updated.filter((item): item is ContentIdea => item !== undefined);
}

export async function moveContentIdeaToParent(
  ideaId: number,
  parentId: number | null,
): Promise<ContentIdea[]> {
  const db = getDB();
  const idea = await db.contentIdeas.get(ideaId);

  if (!idea) {
    throw new Error("Content idea not found");
  }

  if (parentId === idea.parentId) {
    return [idea];
  }

  if (parentId === ideaId) {
    throw new Error("A content idea cannot be moved under itself");
  }

  const allIdeas = await db.contentIdeas.toArray();

  if (parentId) {
    if (isDescendantOf(ideaId, parentId, allIdeas)) {
      throw new Error("A content idea cannot be moved under its own sub-idea");
    }

    const parent = await db.contentIdeas.get(parentId);
    if (!parent) {
      throw new Error("Parent content idea not found");
    }

    if (parent.depth >= 2) {
      throw new Error("Maximum sub-idea depth reached");
    }
  } else if (!canMoveToRoot(ideaId, allIdeas)) {
    throw new Error("This move would exceed the maximum sub-idea depth");
  }

  const validTargets = getValidParentTargets(ideaId, allIdeas);
  if (parentId && !validTargets.some((target) => target.id === parentId)) {
    throw new Error("This move would exceed the maximum sub-idea depth");
  }

  const newDepth: ContentIdeaDepth = parentId
    ? ((await db.contentIdeas.get(parentId))!.depth + 1) as ContentIdeaDepth
    : 0;
  const depthDelta = newDepth - idea.depth;
  const maxDepthInSubtree = getMaxDepthInSubtree(ideaId, allIdeas);

  if (maxDepthInSubtree + depthDelta > 2) {
    throw new Error("This move would exceed the maximum sub-idea depth");
  }

  const descendantIds = await collectDescendantIdsFromDb(ideaId);
  const allIds = [ideaId, ...descendantIds];
  const newProjectId = parentId
    ? (await db.contentIdeas.get(parentId))!.projectId
    : idea.projectId;
  const newSortOrder = await (async () => {
    const siblings = allIdeas.filter(
      (item) => item.parentId === parentId && item.id !== ideaId,
    );
    if (siblings.length === 0) {
      return 0;
    }
    return Math.max(...siblings.map((item) => item.sortOrder ?? 0)) + 1;
  })();

  await db.transaction("rw", db.contentIdeas, async () => {
    for (const id of allIds) {
      const existing = await db.contentIdeas.get(id);
      if (!existing) continue;

      const updated: ContentIdea = {
        ...existing,
        depth: (existing.depth + depthDelta) as ContentIdeaDepth,
        projectId: newProjectId,
        ...(id === ideaId ? { parentId, sortOrder: newSortOrder } : {}),
      };

      await db.contentIdeas.put(updated);
    }
  });

  const updatedIdeas = await Promise.all(allIds.map((id) => db.contentIdeas.get(id)));

  return updatedIdeas.filter(
    (item): item is ContentIdea => item !== undefined,
  );
}

export async function deleteContentIdea(
  id: number,
): Promise<{ deletedSubCount: number }> {
  const db = getDB();
  const descendantIds = await collectDescendantIdsFromDb(id);
  const allIds = [...descendantIds, id];

  for (const ideaId of allIds) {
    await logContentIdeaActivity(ideaId, "Content Idea Deleted");
  }

  await db.contentIdeas.bulkDelete(allIds);

  return { deletedSubCount: descendantIds.length };
}

export async function deleteContentIdeasByProjectId(
  projectId: string,
): Promise<void> {
  const db = getDB();
  const ideas = await db.contentIdeas.where("projectId").equals(projectId).toArray();

  for (const idea of ideas) {
    if (idea.id !== undefined) {
      await logContentIdeaActivity(idea.id, "Content Idea Deleted");
    }
  }

  await db.contentIdeas.where("projectId").equals(projectId).delete();
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
