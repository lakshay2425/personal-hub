"use client";

import { formatWeekLabel } from "../lib/weekUtils";
import { TaskRow } from "./TaskRow";
import type { Task } from "../types";

interface BacklogTabProps {
  tasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveToWeek: (task: Task) => void;
}

export function BacklogTab({
  tasks,
  onToggle,
  onDelete,
  onMoveToWeek,
}: BacklogTabProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No backlog. You&apos;re all caught up.
      </p>
    );
  }

  return (
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
  );
}
