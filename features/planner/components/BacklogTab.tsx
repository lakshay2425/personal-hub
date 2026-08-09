"use client";

import { formatWeekLabel } from "../lib/weekUtils";
import type { Task } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

interface BacklogTabProps {
  tasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveToWeek: (task: Task) => void;
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
}

export function BacklogTab({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToWeek,
  onViewNotes,
  onReorder,
}: BacklogTabProps) {
  return (
    <SortableTaskTree
      tasks={tasks}
      showMoveToWeek
      getWeekLabel={(task) => formatWeekLabel(task.weekStart)}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddSubTask={onAddSubTask}
      onMoveToWeek={onMoveToWeek}
      onViewNotes={onViewNotes}
      onReorder={onReorder}
      emptyMessage="No backlog. You're all caught up."
    />
  );
}
