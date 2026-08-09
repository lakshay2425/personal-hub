"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useMemo, useState } from "react";

import { buildTaskTree, compareTasks } from "../lib/taskTree";
import type { Task } from "../types";
import { SortableTaskTreeItem } from "./SortableTaskTreeItem";

interface SortableTaskTreeProps {
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
  onViewNotes: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
  emptyMessage?: string;
}

export function SortableTaskTree({
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
  onViewNotes,
  onReorder,
  emptyMessage = "No tasks.",
}: SortableTaskTreeProps) {
  const [collapsedTaskIds, setCollapsedTaskIds] = useState<Set<number>>(
    () => new Set(),
  );

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleToggleChildrenCollapse = useCallback((taskId: number) => {
    setCollapsedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const activeId = Number(active.id);
      const overId = Number(over.id);
      const activeTask = tasks.find((task) => task.id === activeId);
      const overTask = tasks.find((task) => task.id === overId);

      if (!activeTask || !overTask) {
        return;
      }

      if (
        (activeTask.parentId ?? null) !== (overTask.parentId ?? null) ||
        activeTask.weekStart !== overTask.weekStart
      ) {
        return;
      }

      const parentId = activeTask.parentId ?? null;
      const weekStart = activeTask.weekStart;
      const siblings = tasks
        .filter(
          (task) =>
            (task.parentId ?? null) === parentId &&
            task.weekStart === weekStart,
        )
        .sort(compareTasks);
      const oldIndex = siblings.findIndex((task) => task.id === activeId);
      const newIndex = siblings.findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(siblings, oldIndex, newIndex);
      await onReorder(
        parentId,
        weekStart,
        reordered.map((task) => task.id!),
      );
    },
    [onReorder, tasks],
  );

  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  const list = (
    <ul className="space-y-2">
      {tree.map((node) => (
        <SortableTaskTreeItem
          key={node.id}
          node={node}
          allTasks={tasks}
          completed={completed}
          sortable={
            sortable && (!reorderOnlyTodo || node.status === "Todo")
          }
          reorderOnlyTodo={reorderOnlyTodo}
          showMoveToWeek={showMoveToWeek}
          weekLabel={getWeekLabel?.(node)}
          isChildrenCollapsed={collapsedTaskIds.has(node.id!)}
          onToggleChildrenCollapse={handleToggleChildrenCollapse}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onMoveToWeek={onMoveToWeek}
          onViewNotes={onViewNotes}
          collapsedTaskIds={collapsedTaskIds}
        />
      ))}
    </ul>
  );

  if (!sortable) {
    return list;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tree.map((node) => node.id!)}
        strategy={verticalListSortingStrategy}
      >
        {list}
      </SortableContext>
    </DndContext>
  );
}
