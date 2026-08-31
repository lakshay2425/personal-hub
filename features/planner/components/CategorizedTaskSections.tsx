"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";
import { UNASSIGNED } from "@/features/settings/types";

import type { Task } from "../types";
import { SortableTaskTree } from "./SortableTaskTree";

const COLLAPSE_STORAGE_KEY = "planner-section-collapsed";

function loadCollapsedSections(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveCollapsedSections(state: Record<string, boolean>) {
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(state));
}

function filterTasksForCategory(tasks: Task[], category: string): Task[] {
  const rootsInCategory = tasks.filter(
    (task) => (task.parentId ?? null) === null && task.category === category,
  );

  if (rootsInCategory.length === 0) {
    return [];
  }

  const includedIds = new Set<number>();

  function addDescendants(parentId: number) {
    for (const task of tasks) {
      if (task.parentId === parentId && task.id !== undefined) {
        includedIds.add(task.id);
        addDescendants(task.id);
      }
    }
  }

  for (const root of rootsInCategory) {
    if (root.id !== undefined) {
      includedIds.add(root.id);
      addDescendants(root.id);
    }
  }

  return tasks.filter((task) => task.id !== undefined && includedIds.has(task.id));
}

function countRootTasks(tasks: Task[], category: string): number {
  return tasks.filter(
    (task) => (task.parentId ?? null) === null && task.category === category,
  ).length;
}

interface CategorizedTaskSectionsProps {
  tasks: Task[];
  sortable?: boolean;
  reorderOnlyTodo?: boolean;
  completed?: boolean;
  showMoveToWeek?: boolean;
  getWeekLabel?: (task: Task) => string | undefined;
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

export function CategorizedTaskSections({
  tasks,
  sortable = true,
  reorderOnlyTodo = false,
  completed = false,
  showMoveToWeek = false,
  getWeekLabel,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToWeek,
  onMoveToCategory,
  onViewNotes,
  onReorder,
  emptyMessage = "No tasks.",
}: CategorizedTaskSectionsProps) {
  const { activePriorities, getColor, getDisplayName } = usePriorities();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    loadCollapsedSections,
  );

  const sections = useMemo(() => {
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

  const toggleSection = useCallback((category: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [category]: !prev[category] };
      saveCollapsedSections(next);
      return next;
    });
  }, []);

  const hasAnyTasks = tasks.length > 0;

  if (!hasAnyTasks) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(({ category, tasks: sectionTasks, count }) => {
        const isCollapsed = collapsed[category] ?? false;
        const color = getColor(category);

        return (
          <section key={category}>
            <button
              type="button"
              onClick={() => toggleSection(category)}
              className="mb-2 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
              )}
              <CategoryBadge
                category={category}
                color={color}
                displayName={getDisplayName(category)}
              />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                ({count})
              </span>
            </button>

            {!isCollapsed ? (
              <SortableTaskTree
                tasks={sectionTasks}
                sortable={sortable}
                reorderOnlyTodo={reorderOnlyTodo}
                completed={completed}
                showMoveToWeek={showMoveToWeek}
                getWeekLabel={getWeekLabel}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubTask={onAddSubTask}
                onMoveToWeek={onMoveToWeek}
                onMoveToCategory={onMoveToCategory}
                onViewNotes={onViewNotes}
                onReorder={onReorder}
                emptyMessage="No tasks in this section."
              />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
