interface TaskProgressBadgeProps {
  done: number;
  total: number;
}

export function TaskProgressBadge({ done, total }: TaskProgressBadgeProps) {
  if (total === 0) return null;

  return (
    <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {done}/{total}
    </span>
  );
}
