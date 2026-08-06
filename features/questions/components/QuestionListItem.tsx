"use client";

import type { QuestionTreeNode } from "../types";
import { countAllDescendants } from "../lib/questionTree";
import { QuestionAnswersPanel } from "./QuestionAnswersPanel";
import { StatusToggle } from "./StatusToggle";

const DEPTH_STYLES = {
  0: "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
  1: "ml-4 rounded-lg border border-zinc-200 border-l-2 border-l-zinc-400 bg-white p-3 dark:border-zinc-800 dark:border-l-zinc-500 dark:bg-zinc-900",
  2: "ml-8 rounded-lg border border-zinc-200 border-l-2 border-l-zinc-300 bg-zinc-50/80 p-2.5 dark:border-zinc-800 dark:border-l-zinc-600 dark:bg-zinc-900/50",
} as const;

const DEPTH_TEXT_STYLES = {
  0: "text-sm font-medium",
  1: "text-sm",
  2: "text-xs",
} as const;

interface QuestionListItemProps {
  node: QuestionTreeNode;
  answerCount: number;
  isExpanded: boolean;
  isChildrenCollapsed: boolean;
  onToggleExpand: (questionId: string) => void;
  onToggleChildrenCollapse: (questionId: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (question: QuestionTreeNode) => void;
  onDelete: (question: QuestionTreeNode) => void;
  onAddSubQuestion: (parent: QuestionTreeNode) => void;
  isToggling?: boolean;
  projectId: string | null;
  onAnswerCountChange?: (questionId: string, count: number) => void;
  collapsedQuestionIds: Set<string>;
  expandedQuestionId: string | null;
  answerCounts: Record<string, number>;
  togglingId?: string | null;
}

export function QuestionListItem({
  node,
  answerCount,
  isExpanded,
  isChildrenCollapsed,
  onToggleExpand,
  onToggleChildrenCollapse,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddSubQuestion,
  isToggling = false,
  projectId,
  onAnswerCountChange,
  collapsedQuestionIds,
  expandedQuestionId,
  answerCounts,
  togglingId,
}: QuestionListItemProps) {
  const { questionText, depth, id } = node;
  const descendantCount = countAllDescendants(node);
  const hasChildren = node.children.length > 0;
  const canAddSubQuestion = depth < 2;

  return (
    <li>
      <div className={DEPTH_STYLES[depth]}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={
                hasChildren ? () => onToggleChildrenCollapse(id) : undefined
              }
              className={`text-left text-zinc-900 dark:text-zinc-50 ${
                DEPTH_TEXT_STYLES[depth]
              } ${hasChildren ? "cursor-pointer hover:underline" : "cursor-default"}`}
            >
              {questionText}
            </button>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {answerCount} {answerCount === 1 ? "answer" : "answers"}
              </p>
              {descendantCount > 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {descendantCount}{" "}
                  {descendantCount === 1 ? "sub-question" : "sub-questions"}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusToggle
              status={node.status}
              onToggle={() => onToggleStatus(id)}
              disabled={isToggling}
            />
            {canAddSubQuestion ? (
              <button
                type="button"
                onClick={() => onAddSubQuestion(node)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Add Sub-question
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onToggleExpand(id)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isExpanded ? "Hide answers" : "View answers"}
            </button>
            <button
              type="button"
              onClick={() => onEdit(node)}
              aria-label="Edit question"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(node)}
              aria-label="Delete question"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>

        {isExpanded ? (
          <QuestionAnswersPanel
            question={node}
            projectId={projectId}
            onAnswerCountChange={onAnswerCountChange}
          />
        ) : null}
      </div>

      {hasChildren && !isChildrenCollapsed ? (
        <ul className="mt-2 space-y-2">
          {node.children.map((child) => (
            <QuestionListItem
              key={child.id}
              node={child}
              answerCount={answerCounts[child.id] ?? 0}
              isExpanded={expandedQuestionId === child.id}
              isChildrenCollapsed={collapsedQuestionIds.has(child.id)}
              onToggleExpand={onToggleExpand}
              onToggleChildrenCollapse={onToggleChildrenCollapse}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubQuestion={onAddSubQuestion}
              isToggling={togglingId === child.id}
              projectId={projectId}
              onAnswerCountChange={onAnswerCountChange}
              collapsedQuestionIds={collapsedQuestionIds}
              expandedQuestionId={expandedQuestionId}
              answerCounts={answerCounts}
              togglingId={togglingId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
