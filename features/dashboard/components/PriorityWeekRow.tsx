"use client";

import type { LogEntry } from "@/features/logger/types";
import type { Task } from "@/features/planner/types";
import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";

import type { CategoryWeekData } from "../lib/dashboardRepository";

interface PriorityWeekRowProps {
  data: CategoryWeekData;
}

export function PriorityWeekRow({ data }: PriorityWeekRowProps) {
  const { getColor, getDisplayName } = usePriorities();
  const taskCount = data.completedTasks.length;
  const logCount = data.logEntries.length;

  return (
    <details className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <CategoryBadge
          category={data.category}
          color={getColor(data.category)}
          displayName={getDisplayName(data.category)}
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {taskCount} task{taskCount === 1 ? "" : "s"} · {logCount} log
          {logCount === 1 ? "" : "s"}
        </span>
      </summary>

      <div className="space-y-4 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {taskCount > 0 ? (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Completed Tasks
            </h4>
            <ul className="space-y-1">
              {data.completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          </div>
        ) : null}

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
        ) : null}

        {taskCount === 0 && logCount === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No activity this week.
          </p>
        ) : null}
      </div>
    </details>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <li className="text-sm text-zinc-700 dark:text-zinc-300">{task.title}</li>
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
