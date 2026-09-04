"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import { compareTasks, countAllDescendants, getDescendantProgress } from "../lib/taskTree";
import type { Task, TaskTreeNode } from "../types";
import { NotesIcon } from "./NotesIcon";
import { PriorityBadge } from "./PriorityBadge";
import { SortableTaskTreeItem } from "./SortableTaskTreeItem";
import { SubTaskHeader } from "./SubTaskHeader";
import { TaskOverflowMenu } from "./TaskOverflowMenu";
import { TaskProgressBadge } from "./TaskProgressBadge";

const DEPTH_PADDING = {
  0: "",
  1: "ml-3 sm:ml-4",
  2: "ml-6 sm:ml-8",
} as const;

type CardVariant = "default" | "tasks";

interface TaskTreeItemProps {
  node: TaskTreeNode;
  allTasks: Task[];
  completed?: boolean;
  cardVariant?: CardVariant;
  showStrikethrough?: boolean;
  sortable?: boolean;
  useTouchReorder?: boolean;
  reorderOnlyTodo?: boolean;
  showMoveToWeek?: boolean;
  weekLabel?: string;
  isChildrenCollapsed: boolean;
  onToggleChildrenCollapse: (taskId: number) => void;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveToWeek?: (task: Task) => void;
  onMoveToCategory?: (task: Task, category: string) => void;
  onViewNotes: (task: Task) => void;
  onReorder?: (
    parentId: number | null,
    weekStart: string,
    orderedIds: number[],
  ) => Promise<void>;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: () => void;
  collapsedTaskIds: Set<number>;
  itemRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

export function TaskTreeItem({
  node,
  allTasks,
  completed = false,
  cardVariant = "default",
  showStrikethrough = true,
  sortable = true,
  useTouchReorder = false,
  reorderOnlyTodo = false,
  showMoveToWeek = false,
  weekLabel,
  isChildrenCollapsed,
  onToggleChildrenCollapse,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveToWeek,
  onMoveToCategory,
  onViewNotes,
  onReorder,
  selectionMode = false,
  isSelected = false,
  onSelectionToggle,
  collapsedTaskIds,
  itemRef,
  style,
  dragHandleProps,
}: TaskTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const canAddSubTask = node.depth < 2;
  const descendantCount = countAllDescendants(node);
  const progress = getDescendantProgress(node.id!, allTasks);
  const isDone = node.status === "Done";
  const checkboxDisabled = hasChildren;
  const isTasksVariant = cardVariant === "tasks";
  const showCompletedStyle = showStrikethrough && (completed || isDone);
  const itemSortable =
    sortable && (!reorderOnlyTodo || node.status === "Todo");

  const siblings = useMemo(() => {
    const parentId = node.parentId ?? null;
    const weekStart = node.weekStart;
    return allTasks
      .filter(
        (task) =>
          (task.parentId ?? null) === parentId &&
          task.weekStart === weekStart,
      )
      .sort(compareTasks);
  }, [allTasks, node.parentId, node.weekStart]);

  const siblingIndex = siblings.findIndex((task) => task.id === node.id);
  const canMoveUp = useTouchReorder && itemSortable && siblingIndex > 0;
  const canMoveDown =
    useTouchReorder &&
    itemSortable &&
    siblingIndex >= 0 &&
    siblingIndex < siblings.length - 1;

  const handleMove = useCallback(
    async (direction: "up" | "down") => {
      if (!onReorder || siblingIndex < 0) return;

      const newIndex =
        direction === "up" ? siblingIndex - 1 : siblingIndex + 1;
      if (newIndex < 0 || newIndex >= siblings.length) return;

      const reordered = arrayMove(siblings, siblingIndex, newIndex);
      await onReorder(
        node.parentId ?? null,
        node.weekStart,
        reordered.map((task) => task.id!),
      );
    },
    [node.parentId, node.weekStart, onReorder, siblingIndex, siblings],
  );

  const metaContent = (
    <div className="flex flex-wrap items-center gap-2">
      {hasChildren ? (
        <TaskProgressBadge done={progress.done} total={progress.total} />
      ) : null}
      {!isTasksVariant ? <PriorityBadge priority={node.priority} /> : null}
      <NotesIcon notes={node.notes} onClick={() => onViewNotes(node)} />
      {weekLabel ? (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {weekLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <li ref={itemRef} style={style} className={DEPTH_PADDING[node.depth]}>
      <div
        className={`group flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 ${
          showCompletedStyle && !isTasksVariant ? "opacity-75" : ""
        }`}
      >
        {useTouchReorder && itemSortable ? (
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              onClick={() => void handleMove("up")}
              disabled={!canMoveUp}
              aria-label="Move task up"
              className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleMove("down")}
              disabled={!canMoveDown}
              aria-label="Move task down"
              className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : itemSortable && dragHandleProps ? (
          <button
            type="button"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            className="shrink-0 cursor-grab rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : itemSortable ? (
          <span className="w-6 shrink-0" aria-hidden />
        ) : null}

        <input
          type="checkbox"
          checked={isDone}
          disabled={checkboxDisabled}
          onChange={(event) => onToggle(node, event.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
          aria-label={
            checkboxDisabled
              ? "Complete sub-tasks to finish this task"
              : isDone
                ? "Mark as todo"
                : "Mark as done"
          }
        />

        {selectionMode && node.depth === 0 ? (
          <input
            type="radio"
            checked={isSelected}
            onChange={onSelectionToggle}
            className="h-4 w-4 shrink-0 border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-label={`Select ${node.title}`}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 items-start gap-2">
          {isTasksVariant ? (
            <div className="min-w-0 flex-1">
              <SubTaskHeader
                title={node.title}
                textClassName="text-sm"
                hasChildren={hasChildren}
                isChildrenCollapsed={isChildrenCollapsed}
                descendantCount={descendantCount}
                onToggleChildrenCollapse={() =>
                  onToggleChildrenCollapse(node.id!)
                }
                completed={showCompletedStyle}
                meta={
                  hasChildren || node.notes ? (
                    <div className="mt-1">{metaContent}</div>
                  ) : null
                }
              />
            </div>
          ) : (
            <SubTaskHeader
              title={node.title}
              textClassName="text-sm"
              hasChildren={hasChildren}
              isChildrenCollapsed={isChildrenCollapsed}
              descendantCount={descendantCount}
              onToggleChildrenCollapse={() =>
                onToggleChildrenCollapse(node.id!)
              }
              completed={showCompletedStyle}
              meta={metaContent}
            />
          )}
        </div>

        {isTasksVariant ? (
          <PriorityBadge priority={node.priority} />
        ) : null}

        <TaskOverflowMenu
          task={node}
          canAddSubTask={canAddSubTask}
          showMoveToWeek={showMoveToWeek}
          onAddSubTask={() => onAddSubTask(node)}
          onEdit={() => onEdit(node)}
          onDelete={() => onDelete(node)}
          onMoveToWeek={
            onMoveToWeek ? () => onMoveToWeek(node) : undefined
          }
          onMoveToCategory={
            onMoveToCategory
              ? (category) => onMoveToCategory(node, category)
              : undefined
          }
        />
      </div>

      {hasChildren && !isChildrenCollapsed ? (
        <SortableContext
          items={node.children.map((child) => child.id!)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-2 space-y-2">
            {node.children.map((child) => (
              <SortableTaskTreeItem
                key={child.id}
                node={child}
                allTasks={allTasks}
                completed={completed}
                cardVariant={cardVariant}
                showStrikethrough={showStrikethrough}
                useTouchReorder={useTouchReorder}
                sortable={
                  sortable && (!reorderOnlyTodo || child.status === "Todo")
                }
                reorderOnlyTodo={reorderOnlyTodo}
                showMoveToWeek={showMoveToWeek}
                isChildrenCollapsed={collapsedTaskIds.has(child.id!)}
                onToggleChildrenCollapse={onToggleChildrenCollapse}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubTask={onAddSubTask}
                onMoveToWeek={onMoveToWeek}
                onMoveToCategory={onMoveToCategory}
                onViewNotes={onViewNotes}
                onReorder={onReorder}
                collapsedTaskIds={collapsedTaskIds}
              />
            ))}
          </ul>
        </SortableContext>
      ) : null}
    </li>
  );
}
