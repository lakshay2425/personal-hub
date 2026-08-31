import type { Task } from "../types";

export function filterTasksForCategory(tasks: Task[], category: string): Task[] {
  const rootsInCategory = tasks.filter(
    (task) => (task.parentId ?? null) === null && task.category === category,
  );

  if (rootsInCategory.length === 0) {
    return [];
  }

  const includedIds = new Set<number>();

  function addDescendants(parentId: number) {
    for (const task of tasks) {
      if (task.parentId === parentId && task.id !== undefined) {
        includedIds.add(task.id);
        addDescendants(task.id);
      }
    }
  }

  for (const root of rootsInCategory) {
    if (root.id !== undefined) {
      includedIds.add(root.id);
      addDescendants(root.id);
    }
  }

  return tasks.filter((task) => task.id !== undefined && includedIds.has(task.id));
}

export function countRootTasks(tasks: Task[], category: string): number {
  return tasks.filter(
    (task) => (task.parentId ?? null) === null && task.category === category,
  ).length;
}
