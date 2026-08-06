"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import type { CSSProperties, HTMLAttributes } from "react";

import { countAllDescendants } from "../lib/contentIdeaTree";
import type { ContentIdea, ContentIdeaTreeNode } from "../types";
import { ContentIdeaOverflowMenu } from "./ContentIdeaOverflowMenu";
import { PublishedLinksSummary } from "./PublishedLinksSummary";
import { SortableContentIdeaListItem } from "./SortableContentIdeaListItem";
import { StatusBadge } from "./StatusBadge";
import { SubIdeaHeader } from "./SubIdeaHeader";

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

interface ContentIdeaListItemProps {
  node: ContentIdeaTreeNode;
  isChildrenCollapsed: boolean;
  onToggleChildrenCollapse: (ideaId: number) => void;
  onEdit: (idea: ContentIdeaTreeNode) => void;
  onDelete: (idea: ContentIdeaTreeNode) => void;
  onAddSubIdea: (parent: ContentIdeaTreeNode) => void;
  onMoveToParent: (ideaId: number, parentId: number | null) => Promise<void>;
  allIdeas: ContentIdea[];
  movingUnderId?: number | null;
  collapsedIdeaIds: Set<number>;
  itemRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}

export function ContentIdeaListItem({
  node,
  isChildrenCollapsed,
  onToggleChildrenCollapse,
  onEdit,
  onDelete,
  onAddSubIdea,
  onMoveToParent,
  allIdeas,
  movingUnderId = null,
  collapsedIdeaIds,
  itemRef,
  style,
  dragHandleProps,
}: ContentIdeaListItemProps) {
  const { title, depth, id } = node;
  const descendantCount = countAllDescendants(node);
  const hasChildren = node.children.length > 0;
  const canAddSubIdea = depth < 2;

  return (
    <li ref={itemRef} style={style}>
      <div className={DEPTH_STYLES[depth]}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {dragHandleProps ? (
              <button
                type="button"
                {...dragHandleProps}
                aria-label="Drag to reorder"
                className="mt-0.5 shrink-0 cursor-grab rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            ) : null}
            <SubIdeaHeader
              title={title}
              textClassName={DEPTH_TEXT_STYLES[depth]}
              hasChildren={hasChildren}
              isChildrenCollapsed={isChildrenCollapsed}
              descendantCount={descendantCount}
              onToggleChildrenCollapse={() => onToggleChildrenCollapse(id!)}
              meta={
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusBadge status={node.status} />
                  <PublishedLinksSummary links={node.publishedLinks} />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Created {format(node.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
              }
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ContentIdeaOverflowMenu
              idea={node}
              allIdeas={allIdeas}
              canAddSubIdea={canAddSubIdea}
              onAddSubIdea={() => onAddSubIdea(node)}
              onEdit={() => onEdit(node)}
              onDelete={() => onDelete(node)}
              onMoveToParent={(parentId) => onMoveToParent(id!, parentId)}
              isMoving={movingUnderId === id}
            />
          </div>
        </div>
      </div>

      {hasChildren && !isChildrenCollapsed ? (
        <SortableContext
          items={node.children.map((child) => child.id!)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-2 space-y-2">
            {node.children.map((child) => (
              <SortableContentIdeaListItem
                key={child.id}
                node={child}
                isChildrenCollapsed={collapsedIdeaIds.has(child.id!)}
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
      ) : null}
    </li>
  );
}
