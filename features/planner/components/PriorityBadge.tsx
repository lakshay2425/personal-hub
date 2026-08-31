import type { TaskPriority } from "../types";

const PRIORITY_DOT_COLORS: Record<TaskPriority, string> = {
  High: "text-red-400 dark:text-red-500",
  Medium: "text-amber-400 dark:text-amber-500",
  Low: "text-zinc-400 dark:text-zinc-500",
};

interface PriorityBadgeProps {
  priority: TaskPriority | null;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
      <span className={PRIORITY_DOT_COLORS[priority]} aria-hidden="true">
        ●
      </span>
      {priority}
    </span>
  );
}
