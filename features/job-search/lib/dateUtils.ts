import {
  addWeeks as addWeeksFns,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";

import type { TimeFilter } from "../types";

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(dateStr: string | number | null | undefined): string {
  if (!dateStr) return "—";
  if (typeof dateStr === "number") {
    return format(new Date(dateStr), "MMM d, yyyy");
  }
  if (!dateStr.trim()) return "—";
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function formatTimestamp(ts: number): string {
  return format(new Date(ts), "MMM d, yyyy h:mm a");
}

export function getTimeFilterStart(filter: TimeFilter): number | null {
  const now = startOfDay(new Date());
  switch (filter) {
    case "today":
      return now.getTime();
    case "last7":
      return subDays(now, 7).getTime();
    case "last30":
      return subDays(now, 30).getTime();
    case "last90":
      return subDays(now, 90).getTime();
    case "all":
      return null;
  }
}

export function isWithinTimeFilter(
  timestamp: number,
  filter: TimeFilter,
): boolean {
  const start = getTimeFilterStart(filter);
  if (start === null) return true;
  return timestamp >= start;
}

export function isDateToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

export function getCurrentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function addWeeks(weekStart: string, delta: number): string {
  return format(addWeeksFns(parseISO(weekStart), delta), "yyyy-MM-dd");
}

export function formatWeekRange(weekStart: string): string {
  const monday = parseISO(weekStart);
  const sunday = endOfWeek(monday, { weekStartsOn: 1 });
  return `${format(monday, "EEE dd MMM")} - ${format(sunday, "EEE dd MMM")}`;
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getCurrentWeekStart();
}

export function isDateInWeek(dateStr: string, weekStart: string): boolean {
  if (!dateStr?.trim()) return false;
  const monday = parseISO(weekStart);
  const sunday = endOfWeek(monday, { weekStartsOn: 1 });
  const startOnly = format(monday, "yyyy-MM-dd");
  const endOnly = format(sunday, "yyyy-MM-dd");
  return dateStr >= startOnly && dateStr <= endOnly;
}

export function isTimestampInWeek(timestamp: number, weekStart: string): boolean {
  return isDateInWeek(format(new Date(timestamp), "yyyy-MM-dd"), weekStart);
}
