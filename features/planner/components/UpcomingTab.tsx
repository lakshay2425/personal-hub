"use client";

import { formatWeekRange } from "../lib/weekUtils";
import { TaskRow } from "./TaskRow";
import type { Task } from "../types";

interface UpcomingTabProps {
  tasksByWeek: Map<string, Task[]>;
  onToggle: (task: Task, markDone: boolean) => void;
  onDelete: (task: Task) => void;
}

export function UpcomingTab({
  tasksByWeek,
  onToggle,
  onDelete,
}: UpcomingTabProps) {
  if (tasksByWeek.size === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No upcoming tasks. Plan ahead by adding tasks for future weeks.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {[...tasksByWeek.entries()].map(([weekStart, tasks]) => (
        <section key={weekStart}>
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {formatWeekRange(weekStart)}
          </h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                completed={task.status === "Done"}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
