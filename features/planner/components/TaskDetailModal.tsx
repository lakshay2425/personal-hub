"use client";

import { useMemo } from "react";

import { Modal } from "@/components/ui/Modal";

import { buildTaskTree, getDescendantProgress } from "../lib/taskTree";
import type { Task, TaskTreeNode } from "../types";
import { NotesIcon } from "./NotesIcon";
import { PriorityBadge } from "./PriorityBadge";
import { TaskProgressBadge } from "./TaskProgressBadge";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  allTasks: Task[];
  onToggle: (task: Task, markDone: boolean) => void;
  onEdit: (task: Task) => void;
  onAddSubTask: (task: Task) => void;
  onViewNotes: (task: Task) => void;
}

function findNode(nodes: TaskTreeNode[], id: number): TaskTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNode(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

interface SubTaskListItemProps {
  node: TaskTreeNode;
  onToggle: (task: Task, markDone: boolean) => void;
  onViewNotes: (task: Task) => void;
  nested?: boolean;
}

function SubTaskListItem({
  node,
  onToggle,
  onViewNotes,
  nested = false,
}: SubTaskListItemProps) {
  const hasChildren = node.children.length > 0;
  const isDone = node.status === "Done";
  const checkboxDisabled = hasChildren;

  return (
    <li className={nested ? "ml-4" : undefined}>
      <div
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
      >
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
        <p
          className={`min-w-0 flex-1 break-words text-sm text-zinc-900 dark:text-zinc-50 ${
            isDone ? "line-through opacity-75" : ""
          }`}
        >
          {node.title}
        </p>
        <NotesIcon notes={node.notes} onClick={() => onViewNotes(node)} />
      </div>

      {hasChildren ? (
        <ul className="mt-2 space-y-2">
          {node.children.map((child) => (
            <SubTaskListItem
              key={child.id}
              node={child}
              onToggle={onToggle}
              onViewNotes={onViewNotes}
              nested
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  allTasks,
  onToggle,
  onEdit,
  onAddSubTask,
  onViewNotes,
}: TaskDetailModalProps) {
  const treeNode = useMemo(() => {
    if (!task?.id) {
      return null;
    }
    const tree = buildTaskTree(allTasks);
    return findNode(tree, task.id);
  }, [task, allTasks]);

  const progress = task
    ? getDescendantProgress(task.id!, allTasks)
    : { done: 0, total: 0 };

  const handleEdit = () => {
    if (!task) return;
    onClose();
    onEdit(task);
  };

  const handleAddSubTask = () => {
    if (!task) return;
    onClose();
    onAddSubTask(task);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task?.title ?? ""}
      size="lg"
    >
      {task ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <TaskProgressBadge done={progress.done} total={progress.total} />
            <NotesIcon notes={task.notes} onClick={() => onViewNotes(task)} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sub-tasks
            </h3>
            {treeNode && treeNode.children.length > 0 ? (
              <ul className="space-y-2">
                {treeNode.children.map((child) => (
                  <SubTaskListItem
                    key={child.id}
                    node={child}
                    onToggle={onToggle}
                    onViewNotes={onViewNotes}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No sub-tasks yet.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleAddSubTask}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Add sub-task
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Edit task
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
