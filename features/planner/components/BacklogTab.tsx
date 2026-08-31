"use client";

import { formatWeekLabel } from "../lib/weekUtils";
import type { Task } from "../types";
import { KanbanTaskBoard } from "./KanbanTaskBoard";

interface BacklogTabProps {
  tasks: Task[];
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionToggle?: (taskId: number) => void;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveToWeek: (task: Task) => void;
  onMoveToCategory?: (task: Task, category: string) => void;
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
}

export function BacklogTab({
  tasks,
  selectionMode,
  selectedIds,
  onSelectionToggle,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToWeek,
  onMoveToCategory,
  onViewNotes,
  onReorder,
}: BacklogTabProps) {
  return (
    <KanbanTaskBoard
      tasks={tasks}
      selectionMode={selectionMode}
      selectedIds={selectedIds}
      onSelectionToggle={onSelectionToggle}
      showMoveToWeek
      getWeekLabel={(task) => formatWeekLabel(task.weekStart)}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddSubTask={onAddSubTask}
      onMoveToWeek={onMoveToWeek}
      onMoveToCategory={onMoveToCategory}
      onViewNotes={onViewNotes}
      onReorder={onReorder}
      emptyMessage="No backlog. You're all caught up."
    />
  );
}
