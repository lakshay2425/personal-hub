"use client";

import { formatWeekLabel } from "../lib/weekUtils";
import { TaskRow } from "./TaskRow";
import type { Task } from "../types";

interface BacklogSectionProps {
  tasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveToWeek: (task: Task) => void;
}

export function BacklogSection({
  tasks,
  onToggle,
  onDelete,
  onMoveToWeek,
}: BacklogSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Backlog
      </h2>

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No backlog. You&apos;re all caught up.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              weekLabel={formatWeekLabel(task.weekStart)}
              onToggle={onToggle}
              onDelete={onDelete}
              onMoveToWeek={onMoveToWeek}
            />
          ))}
        </div>
      )}
    </section>
  );
}
