"use client";

import { format } from "date-fns";

import type { ContentIdea } from "../types";
import { ContentIdeaActions } from "./ContentIdeaActions";
import { PublishedLinksSummary } from "./PublishedLinksSummary";
import { StatusBadge } from "./StatusBadge";

interface ContentIdeasCardsProps {
  ideas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDelete: (idea: ContentIdea) => void;
}

export function ContentIdeasCards({
  ideas,
  onEdit,
  onDelete,
}: ContentIdeasCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {ideas.map((idea) => (
        <li
          key={idea.id}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {idea.title}
            </h3>
            <StatusBadge status={idea.status} />
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

          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <ContentIdeaActions
              compact
              onEdit={() => onEdit(idea)}
              onDelete={() => onDelete(idea)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
