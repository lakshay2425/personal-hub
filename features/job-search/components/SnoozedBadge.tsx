"use client";

import { formatSnoozeDate } from "../lib/snoozeUtils";

export function SnoozedBadge({ until }: { until: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200">
      Snoozed until {formatSnoozeDate(until)}
    </span>
  );
}
