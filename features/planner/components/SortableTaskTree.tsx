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
import { useCallback, useMemo } from "react";

import { useIsTouchDevice } from "@/features/shared/hooks/useIsTouchDevice";

import { buildTaskTree, compareTasks } from "../lib/taskTree";
import type { Task, TaskKind } from "../types";
import { SortableTaskTreeItem } from "./SortableTaskTreeItem";

interface SortableTaskTreeProps {
  tasks: Task[];
  sortable?: boolean;
  completed?: boolean;
  showStrikethrough?: boolean;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveKind?: (task: Task, kind: TaskKind) => void;
  onViewNotes: (task: Task) => void;
  onViewDetail: (task: Task) => void;
  onReorder: (
    parentId: number | null,
    orderedIds: number[],
  ) => Promise<void>;
  emptyMessage?: string;
}

export function SortableTaskTree({
  tasks,
  sortable = true,
  completed = false,
  showStrikethrough = true,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveKind,
  onViewNotes,
  onViewDetail,
  onReorder,
  emptyMessage = "No tasks.",
}: SortableTaskTreeProps) {
  const isTouchDevice = useIsTouchDevice();
  const useTouchReorder = isTouchDevice && sortable;

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

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

      if ((activeTask.parentId ?? null) !== (overTask.parentId ?? null)) {
        return;
      }

      const parentId = activeTask.parentId ?? null;
      const siblings = tasks
        .filter((task) => (task.parentId ?? null) === parentId)
        .sort(compareTasks);
      const oldIndex = siblings.findIndex((task) => task.id === activeId);
      const newIndex = siblings.findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(siblings, oldIndex, newIndex);
      await onReorder(
        parentId,
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
          showStrikethrough={showStrikethrough}
          useTouchReorder={useTouchReorder}
          sortable={sortable}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onMoveKind={onMoveKind}
          onViewNotes={onViewNotes}
          onViewDetail={onViewDetail}
          onReorder={onReorder}
        />
      ))}
    </ul>
  );

  if (!sortable || useTouchReorder) {
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
