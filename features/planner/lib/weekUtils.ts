import {
  addWeeks as addWeeksFns,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";

import type { Task, TaskPriority } from "../types";

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function parseDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMondayOfWeek(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return toDateString(monday);
}

export function getCurrentWeekStart(): string {
  return getMondayOfWeek(new Date());
}

export function addWeeks(weekStart: string, delta: number): string {
  const monday = parseDateString(weekStart);
  return toDateString(addWeeksFns(monday, delta));
}

export function formatWeekRange(weekStart: string): string {
  const monday = parseDateString(weekStart);
  const sunday = endOfWeek(monday, { weekStartsOn: 1 });
  return `${format(monday, "EEE dd MMM")} - ${format(sunday, "EEE dd MMM")}`;
}

export function formatWeekLabel(weekStart: string): string {
  const monday = parseDateString(weekStart);
  return `From week of ${format(monday, "dd MMM")}`;
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getCurrentWeekStart();
}

export function sortTasksByPriority<T extends Pick<Task, "priority" | "createdAt">>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt - b.createdAt;
  });
}

export function sortCompletedTasks<T extends Pick<Task, "completedAt">>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => {
    const aTime = a.completedAt ?? 0;
    const bTime = b.completedAt ?? 0;
    return aTime - bTime;
  });
}
