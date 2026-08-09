"use client";

import { formatWeekRange } from "../lib/weekUtils";
import type { Task } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

interface UpcomingTabProps {
  tasksByWeek: Map<string, Task[]>;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
}

export function UpcomingTab({
  tasksByWeek,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onViewNotes,
  onReorder,
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
          <SortableTaskTree
            tasks={tasks}
            reorderOnlyTodo
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubTask={onAddSubTask}
            onViewNotes={onViewNotes}
            onReorder={onReorder}
            emptyMessage="No todo tasks for this week."
          />
        </section>
      ))}
    </div>
  );
}
