import { format, startOfDay, subDays } from "date-fns";

import type { TimeFilter } from "../types";

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(dateStr: string | number | undefined): string {
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
