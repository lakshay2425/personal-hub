"use client";

import { useCallback, useState } from "react";

import type { Task } from "../types";
import { KanbanTaskBoard } from "./KanbanTaskBoard";
import {
  TasksStatusTabNav,
  type TasksStatusTab,
} from "./TasksStatusTabNav";

interface TasksViewProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onAddTask: () => void;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionToggle?: (taskId: number) => void;
  onToggle: (task: Task, markDone: boolean) => Promise<void>;
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

export function TasksView({
  pendingTasks,
  completedTasks,
  onAddTask,
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
}: TasksViewProps) {
  const [statusTab, setStatusTab] = useState<TasksStatusTab>("pending");

  const handleToggle = useCallback(
    async (task: Task, markDone: boolean) => {
      await onToggle(task, markDone);
      if (!markDone && statusTab === "completed") {
        setStatusTab("pending");
      }
    },
    [onToggle, statusTab],
  );

  const isPending = statusTab === "pending";
  const tasks = isPending ? pendingTasks : completedTasks;

  if (tasks.length === 0) {
    return (
      <>
        <TasksStatusTabNav activeTab={statusTab} onTabChange={setStatusTab} />
        <div className="py-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isPending
              ? "No pending tasks this week. Add your first one."
              : "No completed tasks this week. Keep going."}
          </p>
          {isPending ? (
            <button
              type="button"
              onClick={onAddTask}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add Task
            </button>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <TasksStatusTabNav activeTab={statusTab} onTabChange={setStatusTab} />
      <KanbanTaskBoard
        tasks={tasks}
        sortable={isPending}
        cardVariant="tasks"
        showStrikethrough={isPending}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionToggle={onSelectionToggle}
        onToggle={handleToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddSubTask={onAddSubTask}
        onMoveToCategory={onMoveToCategory}
        onViewNotes={onViewNotes}
        onReorder={onReorder}
      />
    </>
  );
}
