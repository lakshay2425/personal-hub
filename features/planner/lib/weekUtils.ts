import {
  addWeeks as addWeeksFns,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";

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

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getCurrentWeekStart();
}
