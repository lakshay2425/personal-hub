"use client";

import {
  DndContext,
  PointerSensor,
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
import { useCallback } from "react";

import type { Question, QuestionTreeNode } from "../types";
import { buildQuestionTree, compareQuestions } from "../lib/questionTree";
import { SortableQuestionListItem } from "./SortableQuestionListItem";

interface SortableQuestionListProps {
  questions: Question[];
  answerCounts: Record<string, number>;
  expandedQuestionId: string | null;
  collapsedQuestionIds: Set<string>;
  projectId: string | null;
  onToggleExpand: (questionId: string) => void;
  onToggleChildrenCollapse: (questionId: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (question: QuestionTreeNode) => void;
  onDelete: (question: QuestionTreeNode) => void;
  onAddSubQuestion: (parent: QuestionTreeNode) => void;
  onMoveToParent: (questionId: string, parentId: string | null) => Promise<void>;
  onReorder: (parentId: string | null, orderedIds: string[]) => Promise<void>;
  allQuestions: Question[];
  movingUnderId?: string | null;
  onAnswerCountChange?: (questionId: string, count: number) => void;
  togglingId?: string | null;
}

export function SortableQuestionList({
  questions,
  answerCounts,
  expandedQuestionId,
  collapsedQuestionIds,
  projectId,
  onToggleExpand,
  onToggleChildrenCollapse,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddSubQuestion,
  onMoveToParent,
  onReorder,
  allQuestions,
  movingUnderId,
  onAnswerCountChange,
  togglingId,
}: SortableQuestionListProps) {
  const tree = buildQuestionTree(questions);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);
      const activeQuestion = questions.find((question) => question.id === activeId);
      const overQuestion = questions.find((question) => question.id === overId);

      if (!activeQuestion || !overQuestion) {
        return;
      }

      if (activeQuestion.parentId !== overQuestion.parentId) {
        return;
      }

      const parentId = activeQuestion.parentId;
      const siblings = questions
        .filter((question) => question.parentId === parentId)
        .sort(compareQuestions);
      const oldIndex = siblings.findIndex((question) => question.id === activeId);
      const newIndex = siblings.findIndex((question) => question.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(siblings, oldIndex, newIndex);
      await onReorder(
        parentId,
        reordered.map((question) => question.id),
      );
    },
    [onReorder, questions],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tree.map((node) => node.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-3">
          {tree.map((node) => (
            <SortableQuestionListItem
              key={node.id}
              node={node}
              answerCount={answerCounts[node.id] ?? 0}
              isExpanded={expandedQuestionId === node.id}
              isChildrenCollapsed={collapsedQuestionIds.has(node.id)}
              onToggleExpand={onToggleExpand}
              onToggleChildrenCollapse={onToggleChildrenCollapse}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubQuestion={onAddSubQuestion}
              onMoveToParent={onMoveToParent}
              allQuestions={allQuestions}
              movingUnderId={movingUnderId}
              isToggling={togglingId === node.id}
              projectId={projectId}
              onAnswerCountChange={onAnswerCountChange}
              collapsedQuestionIds={collapsedQuestionIds}
              expandedQuestionId={expandedQuestionId}
              answerCounts={answerCounts}
              togglingId={togglingId}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
