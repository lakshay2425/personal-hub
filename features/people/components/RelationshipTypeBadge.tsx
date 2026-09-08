import type { RelationshipType } from "../types";

const RELATIONSHIP_BADGE_CONFIG: Record<RelationshipType, string> = {
  Colleague:
    "bg-indigo-50 text-indigo-800 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-800",
  Friend:
    "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800",
  "Met in person":
    "bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-800",
  Online:
    "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800",
  Other:
    "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
};

export function RelationshipTypeBadge({
  relationshipType,
}: {
  relationshipType: RelationshipType;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${RELATIONSHIP_BADGE_CONFIG[relationshipType]}`}
    >
      {relationshipType}
    </span>
  );
}
