"use client";

import { useState } from "react";
import type { Task, TaskKind } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

interface PlannerKindSectionProps {
  title: string;
  description: string;
  tasks: Task[];
  completedTasks?: Task[];
  emptyMessage: string;
  completedEmptyMessage?: string;
  showCompletionToggle?: boolean;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveKind: (task: Task, kind: TaskKind) => void;
  onViewNotes: (task: Task) => void;
  onViewDetail: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    orderedIds: number[],
  ) => Promise<void>;
}

export function PlannerKindSection({
  title,
  description,
  tasks,
  completedTasks,
  emptyMessage,
  completedEmptyMessage = "No completed tasks.",
  showCompletionToggle = true,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveKind,
  onViewNotes,
  onViewDetail,
  onReorder,
}: PlannerKindSectionProps) {
  const [view, setView] = useState<"pending" | "completed">("pending");
  const treeHandlers = {
    onToggle,
    onEdit,
    onDelete,
    onAddSubTask,
    onMoveKind,
    onViewNotes,
    onViewDetail,
    onReorder,
  };

  return (
    <section className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>

      {completedTasks !== undefined ? (
        <div
          className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
          role="tablist"
          aria-label={`${title} task status`}
        >
          {(
            [
              ["pending", "Pending", tasks.length],
              ["completed", "Completed", completedTasks.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      ) : null}

      {view === "pending" || completedTasks === undefined ? (
        <SortableTaskTree
          tasks={tasks}
          emptyMessage={emptyMessage}
          showCompletionToggle={showCompletionToggle}
          {...treeHandlers}
        />
      ) : (
        <SortableTaskTree
          tasks={completedTasks}
          sortable={false}
          completed
          emptyMessage={completedEmptyMessage}
          showCompletionToggle={showCompletionToggle}
          {...treeHandlers}
        />
      )}
    </section>
  );
}
