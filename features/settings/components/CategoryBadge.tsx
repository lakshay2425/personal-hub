"use client";

import { UNASSIGNED } from "../types";

interface CategoryBadgeProps {
  category: string;
  color?: string | null;
  displayName?: string;
}

export function CategoryBadge({
  category,
  color,
  displayName,
}: CategoryBadgeProps) {
  const label =
    displayName ?? (category === UNASSIGNED ? "Unassigned" : category);
  const isUnassigned = category === UNASSIGNED || !color;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isUnassigned
          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          : "text-white"
      }`}
      style={!isUnassigned && color ? { backgroundColor: color } : undefined}
    >
      {label}
    </span>
  );
}
