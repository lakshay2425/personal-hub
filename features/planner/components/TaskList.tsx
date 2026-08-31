"use client";

import type { Task } from "../types";
import { KanbanTaskBoard } from "./KanbanTaskBoard";

interface TaskListProps {
  tasks: Task[];
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionToggle?: (taskId: number) => void;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveToCategory?: (task: Task, category: string) => void;
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
}

export function TaskList({
  tasks,
  selectionMode,
  selectedIds,
  onSelectionToggle,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToCategory,
  onViewNotes,
  onReorder,
}: TaskListProps) {
  return (
    <KanbanTaskBoard
      tasks={tasks}
      selectionMode={selectionMode}
      selectedIds={selectedIds}
      onSelectionToggle={onSelectionToggle}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddSubTask={onAddSubTask}
      onMoveToCategory={onMoveToCategory}
      onViewNotes={onViewNotes}
      onReorder={onReorder}
      emptyMessage="No tasks for this week. Add your first one."
    />
  );
}
