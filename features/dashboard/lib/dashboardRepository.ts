import { addDays, format, parseISO } from "date-fns";

import { getAllLogEntries } from "@/features/logger/lib/loggerRepository";
import type { LogEntry } from "@/features/logger/types";
import { getAllTasks } from "@/features/planner/lib/tasksRepository";
import type { Task, TaskKind } from "@/features/planner/types";
import { getPriorities } from "@/features/settings/lib/prioritiesRepository";
import { UNASSIGNED, type PrioritiesSettings } from "@/features/settings/types";

export interface KindWeekData {
  kind: Extract<TaskKind, "sprint" | "recursive">;
  label: string;
  openRoots: Task[];
  completedThisWeek: Task[];
}

export interface CategoryWeekData {
  category: string;
  logEntries: LogEntry[];
}

export interface DashboardWeekData {
  weekStart: string;
  weekEnd: string;
  kinds: KindWeekData[];
  totalOpenRoots: number;
  totalCompletedThisWeek: number;
  categories: CategoryWeekData[];
}

function getWeekEnd(weekStart: string): string {
  const monday = parseISO(weekStart);
  return format(addDays(monday, 6), "yyyy-MM-dd");
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

function isRoot(task: Task): boolean {
  return (task.parentId ?? null) === null;
}

export function buildDashboardWeekData(
  weekStart: string,
  tasks: Task[],
  logEntries: LogEntry[],
  priorities: PrioritiesSettings,
): DashboardWeekData {
  const weekEnd = getWeekEnd(weekStart);
  const completedThisWeek = tasks.filter(
    (task) =>
      task.status === "Done" &&
      task.completedAt !== null &&
      isDateInWeek(completedAtToDate(task.completedAt), weekStart, weekEnd),
  );

  function kindData(
    kind: Extract<TaskKind, "sprint" | "recursive">,
    label: string,
  ): KindWeekData {
    return {
      kind,
      label,
      openRoots: tasks.filter(
        (task) =>
          task.kind === kind && isRoot(task) && task.status === "Todo",
      ),
      completedThisWeek: completedThisWeek.filter((task) => task.kind === kind),
    };
  }

  const kinds: KindWeekData[] = [
    kindData("sprint", "Sprint"),
    kindData("recursive", "Iterative"),
  ];

  const weekLogs = logEntries.filter((entry) =>
    isDateInWeek(entry.date, weekStart, weekEnd),
  );
  const categoryNames = priorities.slots
    .filter((slot) => slot !== null)
    .map((slot) => slot.name);
  const categories: CategoryWeekData[] = categoryNames.map((category) => ({
    category,
    logEntries: weekLogs.filter(
      (entry) => normalizeCategory(entry.category) === category,
    ),
  }));

  return {
    weekStart,
    weekEnd,
    kinds,
    totalOpenRoots: kinds.reduce((sum, kind) => sum + kind.openRoots.length, 0),
    totalCompletedThisWeek: kinds.reduce(
      (sum, kind) => sum + kind.completedThisWeek.length,
      0,
    ),
    categories,
  };
}

export async function getDashboardWeekData(
  weekStart: string,
): Promise<DashboardWeekData> {
  const [tasks, logEntries, priorities] = await Promise.all([
    getAllTasks(),
    getAllLogEntries(),
    getPriorities(),
  ]);
  return buildDashboardWeekData(weekStart, tasks, logEntries, priorities);
}
