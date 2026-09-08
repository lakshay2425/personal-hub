import type { DiscoverStatus } from "../types";

const STATUS_BADGE_CONFIG: Record<DiscoverStatus, string> = {
  "To review":
    "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
  Following:
    "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  Passed:
    "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  "Maybe later":
    "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800",
};

export function DiscoverStatusBadge({ status }: { status: DiscoverStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE_CONFIG[status]}`}
    >
      {status}
    </span>
  );
}
