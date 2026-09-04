"use client";

import { useMemo } from "react";

import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";
import { UNASSIGNED } from "@/features/settings/types";

import {
  countRootTasks,
  filterTasksForCategory,
} from "../lib/categoryTasks";
import type { Task } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

type CardVariant = "default" | "tasks";

interface KanbanTaskBoardProps {
  tasks: Task[];
  sortable?: boolean;
  reorderOnlyTodo?: boolean;
  completed?: boolean;
  cardVariant?: CardVariant;
  showStrikethrough?: boolean;
  showMoveToWeek?: boolean;
  getWeekLabel?: (task: Task) => string | undefined;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onSelectionToggle?: (taskId: number) => void;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveToWeek?: (task: Task) => void;
  onMoveToCategory?: (task: Task, category: string) => void;
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
  emptyMessage?: string;
}

export function KanbanTaskBoard({
  tasks,
  sortable = true,
  reorderOnlyTodo = false,
  completed = false,
  cardVariant = "default",
  showStrikethrough = true,
  showMoveToWeek = false,
  getWeekLabel,
  selectionMode = false,
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
  emptyMessage = "No tasks.",
}: KanbanTaskBoardProps) {
  const { activePriorities, getColor, getDisplayName } = usePriorities();

  const columns = useMemo(() => {
    const categories = [
      ...activePriorities.map((priority) => priority.name),
      UNASSIGNED,
    ];
    return categories.map((category) => ({
      category,
      tasks: filterTasksForCategory(tasks, category),
      count: countRootTasks(tasks, category),
    }));
  }, [activePriorities, tasks]);

  const hasAnyTasks = tasks.length > 0;

  if (!hasAnyTasks) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {columns.map(({ category, tasks: columnTasks, count }) => (
        <div
          key={category}
          className="flex w-[min(100%,280px)] min-w-[280px] max-w-[320px] shrink-0 snap-start flex-col rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div
            className="sticky top-0 z-10 flex items-center gap-2 border-b border-l-4 border-zinc-200 bg-white px-3 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            style={{ borderLeftColor: getColor(category) ?? "#a1a1aa" }}
          >
            <CategoryBadge
              category={category}
              color={getColor(category)}
              displayName={getDisplayName(category)}
            />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {count}
            </span>
          </div>

          <div className="max-h-[min(70vh,600px)] flex-1 overflow-y-auto p-2">
            <SortableTaskTree
              tasks={columnTasks}
              sortable={sortable}
              reorderOnlyTodo={reorderOnlyTodo}
              completed={completed}
              cardVariant={cardVariant}
              showStrikethrough={showStrikethrough}
              showMoveToWeek={showMoveToWeek}
              getWeekLabel={getWeekLabel}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionToggle={onSelectionToggle}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubTask={onAddSubTask}
              onMoveToWeek={onMoveToWeek}
              onMoveToCategory={onMoveToCategory}
              onViewNotes={onViewNotes}
              onReorder={onReorder}
              emptyMessage="No tasks"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
