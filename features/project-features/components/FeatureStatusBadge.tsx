import type { FeatureStatus } from "../types";

const STATUS_STYLES: Record<FeatureStatus, string> = {
  Idea: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Planned:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "In Progress":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Dropped: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface FeatureStatusBadgeProps {
  status: FeatureStatus;
}

export function FeatureStatusBadge({ status }: FeatureStatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
