"use client";

import type { Task, TaskKind } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

interface PlannerKindSectionProps {
  title: string;
  description: string;
  tasks: Task[];
  completedTasks?: Task[];
  emptyMessage: string;
  completedEmptyMessage?: string;
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
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveKind,
  onViewNotes,
  onViewDetail,
  onReorder,
}: PlannerKindSectionProps) {
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
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <SortableTaskTree
        tasks={tasks}
        emptyMessage={emptyMessage}
        {...treeHandlers}
      />

      {completedTasks ? (
        <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Completed
          </h3>
          <SortableTaskTree
            tasks={completedTasks}
            sortable={false}
            completed
            emptyMessage={completedEmptyMessage}
            {...treeHandlers}
          />
        </div>
      ) : null}
    </section>
  );
}
