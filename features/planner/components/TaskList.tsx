"use client";

import type { Task } from "../types";
import { CategorizedTaskSections } from "./CategorizedTaskSections";

interface TaskListProps {
  tasks: Task[];
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
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToCategory,
  onViewNotes,
  onReorder,
}: TaskListProps) {
  return (
    <CategorizedTaskSections
      tasks={tasks}
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
