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

import { buildContentIdeaTree, compareContentIdeas } from "../lib/contentIdeaTree";
import type { ContentIdea, ContentIdeaTreeNode } from "../types";
import { SortableContentIdeaListItem } from "./SortableContentIdeaListItem";

interface SortableContentIdeaListProps {
  ideas: ContentIdea[];
  collapsedIdeaIds: Set<number>;
  onToggleChildrenCollapse: (ideaId: number) => void;
  onEdit: (idea: ContentIdeaTreeNode) => void;
  onDelete: (idea: ContentIdeaTreeNode) => void;
  onAddSubIdea: (parent: ContentIdeaTreeNode) => void;
  onMoveToParent: (ideaId: number, parentId: number | null) => Promise<void>;
  onReorder: (parentId: number | null, orderedIds: number[]) => Promise<void>;
  allIdeas: ContentIdea[];
  movingUnderId?: number | null;
}

export function SortableContentIdeaList({
  ideas,
  collapsedIdeaIds,
  onToggleChildrenCollapse,
  onEdit,
  onDelete,
  onAddSubIdea,
  onMoveToParent,
  onReorder,
  allIdeas,
  movingUnderId,
}: SortableContentIdeaListProps) {
  const tree = buildContentIdeaTree(ideas);

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

      const activeId = Number(active.id);
      const overId = Number(over.id);
      const activeIdea = ideas.find((idea) => idea.id === activeId);
      const overIdea = ideas.find((idea) => idea.id === overId);

      if (!activeIdea || !overIdea) {
        return;
      }

      if (activeIdea.parentId !== overIdea.parentId) {
        return;
      }

      const parentId = activeIdea.parentId;
      const siblings = ideas
        .filter((idea) => idea.parentId === parentId)
        .sort(compareContentIdeas);
      const oldIndex = siblings.findIndex((idea) => idea.id === activeId);
      const newIndex = siblings.findIndex((idea) => idea.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(siblings, oldIndex, newIndex);
      await onReorder(
        parentId,
        reordered.map((idea) => idea.id!),
      );
    },
    [ideas, onReorder],
  );

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
        <ul className="space-y-3">
          {tree.map((node) => (
            <SortableContentIdeaListItem
              key={node.id}
              node={node}
              isChildrenCollapsed={collapsedIdeaIds.has(node.id!)}
              onToggleChildrenCollapse={onToggleChildrenCollapse}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubIdea={onAddSubIdea}
              onMoveToParent={onMoveToParent}
              allIdeas={allIdeas}
              movingUnderId={movingUnderId}
              collapsedIdeaIds={collapsedIdeaIds}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
