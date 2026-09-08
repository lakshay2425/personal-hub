"use client";

import { formatTimestamp } from "@/features/job-search/lib/dateUtils";
import { mobileActionClass } from "@/features/job-search/components/MobileListCard";

import type { NetworkPerson } from "../types";
import { PeoplePlatformBadge } from "./PeoplePlatformBadge";
import { RelationshipTypeBadge } from "./RelationshipTypeBadge";

interface NetworkPersonCardProps {
  person: NetworkPerson;
  onEdit: () => void;
  onDelete: () => void;
}

export function NetworkPersonCard({
  person,
  onEdit,
  onDelete,
}: NetworkPersonCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {person.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PeoplePlatformBadge platform={person.platform} />
            <RelationshipTypeBadge relationshipType={person.relationshipType} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Open profile
          </a>
          <button
            type="button"
            onClick={onEdit}
            className={mobileActionClass.edit}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={mobileActionClass.delete}
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300">{person.howWeKnow}</p>
      {person.metAt ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Met at {person.metAt}
        </p>
      ) : null}
      {person.notes ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {person.notes}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Added {formatTimestamp(person.createdAt)}
      </p>
    </article>
  );
}
