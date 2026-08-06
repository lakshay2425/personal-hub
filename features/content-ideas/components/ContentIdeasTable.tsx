"use client";

import { format } from "date-fns";

import type { ContentIdea } from "../types";
import { ContentIdeaActions } from "./ContentIdeaActions";
import { PublishedLinksSummary } from "./PublishedLinksSummary";
import { StatusBadge } from "./StatusBadge";

interface ContentIdeasTableProps {
  ideas: ContentIdea[];
  onEdit: (idea: ContentIdea) => void;
  onDelete: (idea: ContentIdea) => void;
}

export function ContentIdeasTable({
  ideas,
  onEdit,
  onDelete,
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
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Published Links
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {idea.title}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={idea.status} />
              </td>
              <td className="px-4 py-3">
                <PublishedLinksSummary links={idea.publishedLinks} />
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                {format(idea.createdAt, "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3">
                <ContentIdeaActions
                  onEdit={() => onEdit(idea)}
                  onDelete={() => onDelete(idea)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
