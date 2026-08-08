"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { TaskRow } from "./TaskRow";
import type { Task } from "../types";

interface CompletedTasksSectionProps {
  tasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onDelete: (task: Task) => void;
}

export function CompletedTasksSection({
  tasks,
  onToggle,
  onDelete,
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

      {isExpanded && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              completed
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
