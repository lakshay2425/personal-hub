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
