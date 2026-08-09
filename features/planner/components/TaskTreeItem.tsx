"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import type { CSSProperties, HTMLAttributes } from "react";

import {
  countAllDescendants,
  getDescendantProgress,
} from "../lib/taskTree";
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

interface TaskTreeItemProps {
  node: TaskTreeNode;
  allTasks: Task[];
  completed?: boolean;
  sortable?: boolean;
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
  onViewNotes: (task: Task) => void;
  collapsedTaskIds: Set<number>;
  itemRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

export function TaskTreeItem({
  node,
  allTasks,
  completed = false,
  sortable = true,
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
  onViewNotes,
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

  return (
    <li ref={itemRef} style={style} className={DEPTH_PADDING[node.depth]}>
      <div
        className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 ${
          completed ? "opacity-75" : ""
        }`}
      >
        {sortable && dragHandleProps ? (
          <button
            type="button"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            className="shrink-0 cursor-grab rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : sortable ? (
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

        <div className="flex min-w-0 flex-1 items-start gap-2">
          <SubTaskHeader
            title={node.title}
            textClassName="text-sm"
            hasChildren={hasChildren}
            isChildrenCollapsed={isChildrenCollapsed}
            descendantCount={descendantCount}
            onToggleChildrenCollapse={() =>
              onToggleChildrenCollapse(node.id!)
            }
            completed={completed || isDone}
            meta={
              <div className="flex flex-wrap items-center gap-2">
                {hasChildren ? (
                  <TaskProgressBadge
                    done={progress.done}
                    total={progress.total}
                  />
                ) : null}
                <PriorityBadge priority={node.priority} />
                <NotesIcon
                  notes={node.notes}
                  onClick={() => onViewNotes(node)}
                />
                {weekLabel ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {weekLabel}
                  </span>
                ) : null}
              </div>
            }
          />
        </div>

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
                onViewNotes={onViewNotes}
                collapsedTaskIds={collapsedTaskIds}
              />
            ))}
          </ul>
        </SortableContext>
      ) : null}
    </li>
  );
}
