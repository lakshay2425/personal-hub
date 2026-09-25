"use client";

import type { LogEntry } from "@/features/logger/types";
import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";

import type { CategoryWeekData } from "../lib/dashboardRepository";

interface PriorityWeekRowProps {
  data: CategoryWeekData;
  weekTotal: number;
}

export function PriorityWeekRow({ data, weekTotal }: PriorityWeekRowProps) {
  const { getColor, getDisplayName } = usePriorities();
  const logCount = data.logEntries.length;
  const widthPercent =
    weekTotal > 0 ? (logCount / weekTotal) * 100 : 0;
  const color = getColor(data.category) ?? "#a1a1aa";
  const displayName = getDisplayName(data.category);

  return (
    <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="space-y-2">
          <CategoryBadge
            category={data.category}
            color={getColor(data.category)}
            displayName={displayName}
          />
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
            title={`${displayName}: ${logCount} logs`}
          >
            {logCount > 0 ? (
              <div
                className="h-full min-w-[4px] rounded-full transition-all"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                }}
              />
            ) : null}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {logCount} log{logCount === 1 ? "" : "s"}
          </p>
        </div>
      </summary>

      <div className="space-y-4 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {logCount > 0 ? (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Log Entries
            </h4>
            <ul className="space-y-1">
              {data.logEntries.map((entry) => (
                <LogItem key={entry.id} entry={entry} />
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No log entries this week.
          </p>
        )}
      </div>
    </details>
  );
}

function LogItem({ entry }: { entry: LogEntry }) {
  return (
    <li className="text-sm text-zinc-700 dark:text-zinc-300">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {entry.date}:{" "}
      </span>
      {entry.text}
    </li>
  );
}
