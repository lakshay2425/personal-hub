"use client";

import { format } from "date-fns";

import type { ContentIdea, ContentIdeaTreeNode } from "../types";
import { ContentIdeaOverflowMenu } from "./ContentIdeaOverflowMenu";
import { PublishedLinksSummary } from "./PublishedLinksSummary";
import { StatusBadge } from "./StatusBadge";

interface ContentIdeasCardsProps {
  ideas: ContentIdea[];
  allIdeas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDelete: (idea: ContentIdea) => void;
  onAddSubIdea: (parent: ContentIdeaTreeNode) => void;
  onMoveToParent: (ideaId: number, parentId: number | null) => Promise<void>;
  movingUnderId?: number | null;
}

export function ContentIdeasCards({
  ideas,
  allIdeas,
  onEdit,
  onDelete,
  onAddSubIdea,
  onMoveToParent,
  movingUnderId,
}: ContentIdeasCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {ideas.map((idea) => (
        <li
          key={idea.id}
          className={`flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${
            idea.depth === 1 ? "ml-4" : idea.depth === 2 ? "ml-8" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {idea.title}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={idea.status} />
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
            </div>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Published Links
              </p>
              <div className="mt-1">
                <PublishedLinksSummary links={idea.publishedLinks} />
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Created {format(idea.createdAt, "MMM d, yyyy")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
