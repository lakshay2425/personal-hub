"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import {
  canToggleTaskCompletion,
  compareTasks,
  countAllDescendants,
  getDescendantProgress,
} from "../lib/taskTree";
import type { Task, TaskKind, TaskTreeNode } from "../types";
import { NotesIcon } from "./NotesIcon";
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
  showStrikethrough?: boolean;
  sortable?: boolean;
  useTouchReorder?: boolean;
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onMoveKind?: (task: Task, kind: TaskKind) => void;
  onViewNotes: (task: Task) => void;
  onViewDetail: (task: Task) => void;
  onReorder?: (
    parentId: number | null,
    orderedIds: number[],
  ) => Promise<void>;
  itemRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

export function TaskTreeItem({
  node,
  allTasks,
  completed = false,
  showStrikethrough = true,
  sortable = true,
  useTouchReorder = false,
  onToggle,
  onEdit,
  onDelete,
  onAddSubTask,
  onMoveKind,
  onViewNotes,
  onViewDetail,
  onReorder,
  itemRef,
  style,
  dragHandleProps,
}: TaskTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const canAddSubTask = node.kind !== "inbox" && node.depth < 2;
  const descendantCount = countAllDescendants(node);
  const progress = getDescendantProgress(node.id!, allTasks);
  const isDone = node.status === "Done";
  const showCheckbox = canToggleTaskCompletion(node, hasChildren);
  const showCompletedStyle = showStrikethrough && (completed || isDone);

  const siblings = useMemo(() => {
    const parentId = node.parentId ?? null;
    return allTasks
      .filter((task) => (task.parentId ?? null) === parentId)
      .sort(compareTasks);
  }, [allTasks, node.parentId]);

  const siblingIndex = siblings.findIndex((task) => task.id === node.id);
  const canMoveUp = useTouchReorder && sortable && siblingIndex > 0;
  const canMoveDown =
    useTouchReorder &&
    sortable &&
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
        reordered.map((task) => task.id!),
      );
    },
    [node.parentId, onReorder, siblingIndex, siblings],
  );

  const metaContent = (
    <div className="flex flex-wrap items-center gap-2">
      {hasChildren ? (
        <TaskProgressBadge done={progress.done} total={progress.total} />
      ) : null}
      <NotesIcon notes={node.notes} onClick={() => onViewNotes(node)} />
    </div>
  );

  return (
    <li ref={itemRef} style={style} className={DEPTH_PADDING[node.depth]}>
      <div
        className={`group flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 ${
          showCompletedStyle ? "opacity-75" : ""
        }`}
      >
        {useTouchReorder && sortable ? (
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
        ) : sortable && dragHandleProps ? (
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

        {showCheckbox ? (
          <input
            type="checkbox"
            checked={isDone}
            onChange={(event) => onToggle(node, event.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            aria-label={isDone ? "Mark as todo" : "Mark as done"}
          />
        ) : (
          <span
            className="h-4 w-4 shrink-0"
            aria-hidden
            title={
              hasChildren
                ? "Complete sub-tasks to finish this task"
                : "Add a slice under this practice"
            }
          />
        )}

        <div className="flex min-w-0 flex-1 items-start gap-2">
          <SubTaskHeader
            title={node.title}
            textClassName="text-sm"
            hasChildren={hasChildren}
            descendantCount={descendantCount}
            onTitleClick={
              hasChildren ? () => onViewDetail(node) : undefined
            }
            completed={showCompletedStyle}
            meta={
              hasChildren || node.notes ? (
                <div className="mt-1">{metaContent}</div>
              ) : null
            }
          />
        </div>

        <TaskOverflowMenu
          task={node}
          canAddSubTask={canAddSubTask}
          onAddSubTask={() => onAddSubTask(node)}
          onEdit={() => onEdit(node)}
          onDelete={() => onDelete(node)}
          onMoveKind={
            onMoveKind ? (kind) => onMoveKind(node, kind) : undefined
          }
        />
      </div>
    </li>
  );
}
