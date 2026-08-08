"use client";

import { Trash2 } from "lucide-react";

import { NotesIcon } from "./NotesIcon";
import { PriorityBadge } from "./PriorityBadge";
import type { Task } from "../types";

interface TaskRowProps {
  task: Task;
  completed?: boolean;
  weekLabel?: string;
  onToggle: (task: Task, markDone: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveToWeek?: (task: Task) => void;
}

export function TaskRow({
  task,
  completed = false,
  weekLabel,
  onToggle,
  onDelete,
  onMoveToWeek,
}: TaskRowProps) {
  const isDone = task.status === "Done";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 ${
        completed ? "opacity-75" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={isDone}
        onChange={(event) => onToggle(task, event.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
        aria-label={isDone ? "Mark as todo" : "Mark as done"}
      />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span
          className={`min-w-0 flex-1 text-sm text-zinc-900 dark:text-zinc-50 ${
            completed ? "line-through" : ""
          }`}
        >
          {task.title}
        </span>
        <PriorityBadge priority={task.priority} />
        <NotesIcon notes={task.notes} />
        {weekLabel && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {weekLabel}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onMoveToWeek && (
          <button
            type="button"
            onClick={() => onMoveToWeek(task)}
            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Move to This Week
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
