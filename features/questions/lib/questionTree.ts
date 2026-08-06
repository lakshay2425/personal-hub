import type { Question, QuestionTreeNode } from "../types";

function sortByCreatedAtDesc(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => b.createdAt - a.createdAt);
}

export function buildQuestionTree(questions: Question[]): QuestionTreeNode[] {
  const byParent = new Map<string | null, Question[]>();

  for (const question of questions) {
    const siblings = byParent.get(question.parentId) ?? [];
    siblings.push(question);
    byParent.set(question.parentId, siblings);
  }

  function buildNodes(parentId: string | null): QuestionTreeNode[] {
    const siblings = sortByCreatedAtDesc(byParent.get(parentId) ?? []);
    return siblings.map((question) => ({
      ...question,
      children: buildNodes(question.id),
    }));
  }

  return buildNodes(null);
}

export function countAllDescendants(node: QuestionTreeNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countAllDescendants(child),
    0,
  );
}

export function countDescendantsInList(
  questionId: string,
  questions: Question[],
): number {
  const directChildren = questions.filter(
    (question) => question.parentId === questionId,
  );

  return directChildren.reduce(
    (sum, child) => sum + 1 + countDescendantsInList(child.id, questions),
    0,
  );
}

export function collectDescendantIds(
  questionId: string,
  questions: Question[],
): string[] {
  const ids: string[] = [];

  for (const question of questions) {
    if (question.parentId === questionId) {
      ids.push(question.id);
      ids.push(...collectDescendantIds(question.id, questions));
    }
  }

  return ids;
}

export function isDescendantOf(
  ancestorId: string,
  questionId: string,
  questions: Question[],
): boolean {
  return collectDescendantIds(ancestorId, questions).includes(questionId);
}

export function getMaxDepthInSubtree(
  questionId: string,
  questions: Question[],
): number {
  const question = questions.find((item) => item.id === questionId);
  if (!question) {
    return 0;
  }

  let maxDepth: number = question.depth;
  for (const descendantId of collectDescendantIds(questionId, questions)) {
    const descendant = questions.find((item) => item.id === descendantId);
    if (descendant) {
      maxDepth = Math.max(maxDepth, descendant.depth);
    }
  }

  return maxDepth;
}

export function getValidParentTargets(
  questionId: string,
  questions: Question[],
): Question[] {
  const question = questions.find((item) => item.id === questionId);
  if (!question) {
    return [];
  }

  const maxDepthInSubtree = getMaxDepthInSubtree(questionId, questions);

  return questions.filter((candidate) => {
    if (candidate.id === questionId) {
      return false;
    }
    if (isDescendantOf(questionId, candidate.id, questions)) {
      return false;
    }
    if (candidate.depth >= 2) {
      return false;
    }

    const newDepth = candidate.depth + 1;
    const depthDelta = newDepth - question.depth;

    return maxDepthInSubtree + depthDelta <= 2;
  });
}

export function canMoveToRoot(
  questionId: string,
  questions: Question[],
): boolean {
  const question = questions.find((item) => item.id === questionId);
  if (!question || question.parentId === null) {
    return false;
  }

  const maxDepthInSubtree = getMaxDepthInSubtree(questionId, questions);
  const depthDelta = -question.depth;

  return maxDepthInSubtree + depthDelta <= 2;
}

export function truncateQuestionText(text: string, maxLength = 48): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}
