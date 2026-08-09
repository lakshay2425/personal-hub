"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { countDescendantsInList } from "../lib/taskTree";
import type { Task } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

interface CompletedTasksSectionProps {
  tasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onViewNotes: (task: Task) => void;
}

export function CompletedTasksSection({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onViewNotes,
}: CompletedTasksSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="mb-2 flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Completed ({tasks.length})
      </button>

      {isExpanded ? (
        <SortableTaskTree
          tasks={tasks}
          sortable={false}
          completed
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onViewNotes={onViewNotes}
          onReorder={async () => {}}
          emptyMessage="No completed tasks."
        />
      ) : null}
    </div>
  );
}

export function getDeleteWarningMessage(task: Task, allTasks: Task[]): string {
  const descendantCount = countDescendantsInList(task.id!, allTasks);
  if (descendantCount === 0) {
    return `Are you sure you want to delete "${task.title}"? This action cannot be undone.`;
  }
  return `Delete "${task.title}" and ${descendantCount} sub-task${descendantCount === 1 ? "" : "s"}? This action cannot be undone.`;
}
