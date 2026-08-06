"use client";

import type { Question, QuestionTreeNode } from "../types";
import { countAllDescendants } from "../lib/questionTree";
import { QuestionAnswersPanel } from "./QuestionAnswersPanel";
import { QuestionOverflowMenu } from "./QuestionOverflowMenu";
import { StatusToggle } from "./StatusToggle";
import { SubQuestionHeader } from "./SubQuestionHeader";

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
  onMoveToParent: (questionId: string, parentId: string | null) => Promise<void>;
  allQuestions: Question[];
  movingUnderId?: string | null;
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
  onMoveToParent,
  allQuestions,
  movingUnderId = null,
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
          <SubQuestionHeader
            questionText={questionText}
            textClassName={DEPTH_TEXT_STYLES[depth]}
            hasChildren={hasChildren}
            isChildrenCollapsed={isChildrenCollapsed}
            descendantCount={descendantCount}
            onToggleChildrenCollapse={() => onToggleChildrenCollapse(id)}
            meta={
              <>
                <button
                  type="button"
                  onClick={() => onToggleExpand(id)}
                  className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {isExpanded ? "Hide answers" : "View answers"}
                </button>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {answerCount} {answerCount === 1 ? "answer" : "answers"}
                </p>
              </>
            }
          />

          <div className="flex shrink-0 items-center gap-2">
            <StatusToggle
              status={node.status}
              onToggle={() => onToggleStatus(id)}
              disabled={isToggling}
            />
            <QuestionOverflowMenu
              question={node}
              allQuestions={allQuestions}
              canAddSubQuestion={canAddSubQuestion}
              onAddSubQuestion={() => onAddSubQuestion(node)}
              onEdit={() => onEdit(node)}
              onDelete={() => onDelete(node)}
              onMoveToParent={(parentId) => onMoveToParent(id, parentId)}
              isMoving={movingUnderId === id}
            />
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
              onMoveToParent={onMoveToParent}
              allQuestions={allQuestions}
              movingUnderId={movingUnderId}
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
