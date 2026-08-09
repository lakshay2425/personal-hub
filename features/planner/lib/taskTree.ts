import type { Task, TaskTreeNode } from "../types";

export function compareTasks(a: Task, b: Task): number {
  const orderA = a.sortOrder ?? 0;
  const orderB = b.sortOrder ?? 0;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.createdAt - b.createdAt;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(compareTasks);
}

export function buildTaskTree(tasks: Task[]): TaskTreeNode[] {
  const byParent = new Map<number | null, Task[]>();

  for (const task of tasks) {
    const parentKey = task.parentId ?? null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(task);
    byParent.set(parentKey, siblings);
  }

  function buildNodes(parentId: number | null): TaskTreeNode[] {
    const siblings = sortTasks(byParent.get(parentId) ?? []);
    return siblings.map((task) => ({
      ...task,
      children: buildNodes(task.id!),
    }));
  }

  return buildNodes(null);
}

export function countAllDescendants(node: TaskTreeNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countAllDescendants(child),
    0,
  );
}

export function countDescendantsInList(
  taskId: number,
  tasks: Task[],
): number {
  const directChildren = tasks.filter((task) => task.parentId === taskId);

  return directChildren.reduce(
    (sum, child) => sum + 1 + countDescendantsInList(child.id!, tasks),
    0,
  );
}

export function collectDescendantIds(
  taskId: number,
  tasks: Task[],
): number[] {
  const ids: number[] = [];

  for (const task of tasks) {
    if (task.parentId === taskId) {
      ids.push(task.id!);
      ids.push(...collectDescendantIds(task.id!, tasks));
    }
  }

  return ids;
}

export function getDescendantProgress(
  taskId: number,
  tasks: Task[],
): { done: number; total: number } {
  const descendantIds = collectDescendantIds(taskId, tasks);
  const descendants = descendantIds
    .map((id) => tasks.find((task) => task.id === id))
    .filter((task): task is Task => Boolean(task));

  return {
    done: descendants.filter((task) => task.status === "Done").length,
    total: descendants.length,
  };
}
