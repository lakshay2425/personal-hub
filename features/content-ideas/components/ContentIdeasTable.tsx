"use client";

import { format } from "date-fns";

import type { ContentIdea, ContentIdeaTreeNode } from "../types";
import { ContentIdeaOverflowMenu } from "./ContentIdeaOverflowMenu";
import { PublishedLinksSummary } from "./PublishedLinksSummary";
import { StatusBadge } from "./StatusBadge";

const DEPTH_PADDING = {
  0: "",
  1: "pl-2 sm:pl-4",
  2: "pl-4 sm:pl-8",
} as const;

interface ContentIdeasTableProps {
  ideas: ContentIdea[];
  allIdeas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDelete: (idea: ContentIdea) => void;
  onAddSubIdea: (parent: ContentIdeaTreeNode) => void;
  onMoveToParent: (ideaId: number, parentId: number | null) => Promise<void>;
  movingUnderId?: number | null;
}

export function ContentIdeasTable({
  ideas,
  allIdeas,
  onEdit,
  onDelete,
  onAddSubIdea,
  onMoveToParent,
  movingUnderId,
}: ContentIdeasTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 md:table-cell dark:text-zinc-400">
              Published Links
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 sm:table-cell dark:text-zinc-400">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {ideas.map((idea) => (
            <tr key={idea.id}>
              <td
                className={`max-w-[12rem] px-4 py-3 text-sm font-medium break-words text-zinc-900 sm:max-w-none dark:text-zinc-50 ${DEPTH_PADDING[idea.depth]}`}
              >
                {idea.title}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={idea.status} />
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <PublishedLinksSummary links={idea.publishedLinks} />
              </td>
              <td className="hidden px-4 py-3 text-sm text-zinc-500 sm:table-cell dark:text-zinc-400">
                {format(idea.createdAt, "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3 text-right">
                <ContentIdeaOverflowMenu
                  idea={idea}
                  allIdeas={allIdeas}
                  canAddSubIdea={idea.depth < 2}
                  onAddSubIdea={() =>
                    onAddSubIdea({ ...idea, children: [] })
                  }
                  onEdit={() => onEdit(idea)}
                  onDelete={() => onDelete(idea)}
                  onMoveToParent={(parentId) =>
                    onMoveToParent(idea.id!, parentId)
                  }
                  isMoving={movingUnderId === idea.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
