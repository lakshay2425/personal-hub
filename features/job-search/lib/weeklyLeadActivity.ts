import { addDays, format, parseISO } from "date-fns";

import type { LeadWithTouchpoints } from "../types";
import type { LeadsViewMode } from "./leadListUtils";

export interface DailyLeadActivity {
  date: string;
  weekday: string;
  dayOfMonth: string;
  count: number;
}

export function getWeeklyLeadActivity(
  leads: LeadWithTouchpoints[],
  weekStart: string,
  viewMode: LeadsViewMode,
): DailyLeadActivity[] {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = format(addDays(parseISO(weekStart), index), "yyyy-MM-dd");
    return {
      date,
      weekday: format(parseISO(date), "EEE"),
      dayOfMonth: format(parseISO(date), "d MMM"),
      count: 0,
    };
  });
  const countsByDate = new Map(days.map((day) => [day.date, 0]));

  if (viewMode === "allLeads") {
    for (const lead of leads) {
      const date = format(new Date(lead.createdAt), "yyyy-MM-dd");
      if (countsByDate.has(date)) {
        countsByDate.set(date, countsByDate.get(date)! + 1);
      }
    }
  } else {
    for (const lead of leads) {
      for (const touchpoint of lead.touchpoints) {
        if (touchpoint.status !== "Sent") continue;
        const date = format(new Date(touchpoint.occurredAt), "yyyy-MM-dd");
        if (countsByDate.has(date)) {
          countsByDate.set(date, countsByDate.get(date)! + 1);
        }
      }
    }
  }

  return days.map((day) => ({
    ...day,
    count: countsByDate.get(day.date) ?? 0,
  }));
}
