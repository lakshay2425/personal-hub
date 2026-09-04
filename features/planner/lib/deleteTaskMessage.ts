import { countDescendantsInList } from "./taskTree";
import type { Task } from "../types";

export function getDeleteWarningMessage(task: Task, allTasks: Task[]): string {
  const descendantCount = countDescendantsInList(task.id!, allTasks);
  if (descendantCount === 0) {
    return `Are you sure you want to delete "${task.title}"? This action cannot be undone.`;
  }
  return `Delete "${task.title}" and ${descendantCount} sub-task${descendantCount === 1 ? "" : "s"}? This action cannot be undone.`;
}
