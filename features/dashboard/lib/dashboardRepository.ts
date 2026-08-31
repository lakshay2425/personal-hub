import { addDays, parseISO } from "date-fns";

import { getAllLogEntries } from "@/features/logger/lib/loggerRepository";
import type { LogEntry } from "@/features/logger/types";
import { getAllTasks } from "@/features/planner/lib/tasksRepository";
import type { Task } from "@/features/planner/types";
import { getPriorities } from "@/features/settings/lib/prioritiesRepository";
import { UNASSIGNED } from "@/features/settings/types";

export interface CategoryWeekData {
  category: string;
  completedTasks: Task[];
  pendingTasks: Task[];
  logEntries: LogEntry[];
}

export interface DashboardWeekData {
  weekStart: string;
  weekEnd: string;
  categories: CategoryWeekData[];
  totalCompletedTasks: number;
  totalPendingTasks: number;
}

function getWeekEnd(weekStart: string): string {
  const monday = parseISO(weekStart);
  return addDays(monday, 6).toISOString().slice(0, 10);
}

function isDateInWeek(dateStr: string, weekStart: string, weekEnd: string): boolean {
  return dateStr >= weekStart && dateStr <= weekEnd;
}

function completedAtToDate(completedAt: number): string {
  return new Date(completedAt).toISOString().slice(0, 10);
}

function normalizeCategory(category?: string): string {
  return category && category.trim() !== "" ? category : UNASSIGNED;
}

function countRootTasks(tasks: Task[]): number {
  return tasks.filter((task) => (task.parentId ?? null) === null).length;
}

export async function getDashboardWeekData(
  weekStart: string,
): Promise<DashboardWeekData> {
  const weekEnd = getWeekEnd(weekStart);
  const [tasks, logEntries, priorities] = await Promise.all([
    getAllTasks(),
    getAllLogEntries(),
    getPriorities(),
  ]);

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "Done" &&
      task.completedAt !== null &&
      isDateInWeek(completedAtToDate(task.completedAt), weekStart, weekEnd),
  );

  const pendingTasks = tasks.filter(
    (task) => task.status === "Todo" && task.weekStart === weekStart,
  );

  const weekLogs = logEntries.filter((entry) =>
    isDateInWeek(entry.date, weekStart, weekEnd),
  );

  const categoryNames = [
    ...priorities.slots
      .filter((slot) => slot !== null)
      .map((slot) => slot!.name),
    UNASSIGNED,
  ];

  const categories: CategoryWeekData[] = categoryNames.map((category) => ({
    category,
    completedTasks: completedTasks.filter(
      (task) => normalizeCategory(task.category) === category,
    ),
    pendingTasks: pendingTasks.filter(
      (task) => normalizeCategory(task.category) === category,
    ),
    logEntries: weekLogs.filter(
      (entry) => normalizeCategory(entry.category) === category,
    ),
  }));

  return {
    weekStart,
    weekEnd,
    categories,
    totalCompletedTasks: countRootTasks(completedTasks),
    totalPendingTasks: countRootTasks(pendingTasks),
  };
}
