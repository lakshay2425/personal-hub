import type { ContentIdea, ContentIdeaTreeNode } from "../types";

export function compareContentIdeas(a: ContentIdea, b: ContentIdea): number {
  const orderA = a.sortOrder ?? 0;
  const orderB = b.sortOrder ?? 0;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return b.createdAt - a.createdAt;
}

function sortContentIdeas(ideas: ContentIdea[]): ContentIdea[] {
  return [...ideas].sort(compareContentIdeas);
}

export function buildContentIdeaTree(ideas: ContentIdea[]): ContentIdeaTreeNode[] {
  const byParent = new Map<number | null, ContentIdea[]>();

  for (const idea of ideas) {
    const siblings = byParent.get(idea.parentId) ?? [];
    siblings.push(idea);
    byParent.set(idea.parentId, siblings);
  }

  function buildNodes(parentId: number | null): ContentIdeaTreeNode[] {
    const siblings = sortContentIdeas(byParent.get(parentId) ?? []);
    return siblings.map((idea) => ({
      ...idea,
      children: buildNodes(idea.id!),
    }));
  }

  return buildNodes(null);
}

export function countAllDescendants(node: ContentIdeaTreeNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countAllDescendants(child),
    0,
  );
}

export function countDescendantsInList(
  ideaId: number,
  ideas: ContentIdea[],
): number {
  const directChildren = ideas.filter((idea) => idea.parentId === ideaId);

  return directChildren.reduce(
    (sum, child) => sum + 1 + countDescendantsInList(child.id!, ideas),
    0,
  );
}

export function collectDescendantIds(
  ideaId: number,
  ideas: ContentIdea[],
): number[] {
  const ids: number[] = [];

  for (const idea of ideas) {
    if (idea.parentId === ideaId) {
      ids.push(idea.id!);
      ids.push(...collectDescendantIds(idea.id!, ideas));
    }
  }

  return ids;
}

export function isDescendantOf(
  ancestorId: number,
  ideaId: number,
  ideas: ContentIdea[],
): boolean {
  return collectDescendantIds(ancestorId, ideas).includes(ideaId);
}

export function getMaxDepthInSubtree(
  ideaId: number,
  ideas: ContentIdea[],
): number {
  const idea = ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return 0;
  }

  let maxDepth: number = idea.depth;
  for (const descendantId of collectDescendantIds(ideaId, ideas)) {
    const descendant = ideas.find((item) => item.id === descendantId);
    if (descendant) {
      maxDepth = Math.max(maxDepth, descendant.depth);
    }
  }

  return maxDepth;
}

export function getValidParentTargets(
  ideaId: number,
  ideas: ContentIdea[],
): ContentIdea[] {
  const idea = ideas.find((item) => item.id === ideaId);
  if (!idea) {
    return [];
  }

  const maxDepthInSubtree = getMaxDepthInSubtree(ideaId, ideas);

  return ideas.filter((candidate) => {
    if (candidate.id === ideaId) {
      return false;
    }
    if (isDescendantOf(ideaId, candidate.id!, ideas)) {
      return false;
    }
    if (candidate.depth >= 2) {
      return false;
    }

    const newDepth = candidate.depth + 1;
    const depthDelta = newDepth - idea.depth;

    return maxDepthInSubtree + depthDelta <= 2;
  });
}

export function canMoveToRoot(
  ideaId: number,
  ideas: ContentIdea[],
): boolean {
  const idea = ideas.find((item) => item.id === ideaId);
  if (!idea || idea.parentId === null) {
    return false;
  }

  const maxDepthInSubtree = getMaxDepthInSubtree(ideaId, ideas);
  const depthDelta = -idea.depth;

  return maxDepthInSubtree + depthDelta <= 2;
}

export function truncateTitle(text: string, maxLength = 48): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}
