"use client";

import { CategoryBadge } from "@/features/settings/components/CategoryBadge";
import { usePriorities } from "@/features/settings/hooks/usePriorities";

import type { CategoryWeekData } from "../lib/dashboardRepository";

interface WeekDistributionBarProps {
  categories: CategoryWeekData[];
  totalCompletedTasks: number;
}

export function WeekDistributionBar({
  categories,
  totalCompletedTasks,
}: WeekDistributionBarProps) {
  const { getColor, getDisplayName } = usePriorities();

  if (totalCompletedTasks === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No completed tasks this week yet.
        </p>
      </div>
    );
  }

  const segments = categories.filter(
    (category) => category.completedTasks.length > 0,
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Task completion distribution
      </h3>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {segments.map((segment) => {
          const width = (segment.completedTasks.length / totalCompletedTasks) * 100;
          const color = getColor(segment.category) ?? "#a1a1aa";

          return (
            <div
              key={segment.category}
              className="h-full transition-all"
              style={{ width: `${width}%`, backgroundColor: color }}
              title={`${getDisplayName(segment.category)}: ${segment.completedTasks.length}`}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => (
          <div key={segment.category} className="flex items-center gap-2">
            <CategoryBadge
              category={segment.category}
              color={getColor(segment.category)}
              displayName={getDisplayName(segment.category)}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {segment.completedTasks.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
