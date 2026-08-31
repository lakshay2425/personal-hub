"use client";

import { usePriorities } from "@/features/settings/hooks/usePriorities";

import type { CategoryWeekData } from "../lib/dashboardRepository";

interface CategoryDistributionChartProps {
  title: string;
  categories: CategoryWeekData[];
  getCount: (data: CategoryWeekData) => number;
  total: number;
  emptyMessage: string;
}

export function CategoryDistributionChart({
  title,
  categories,
  getCount,
  total,
  emptyMessage,
}: CategoryDistributionChartProps) {
  const { getColor, getDisplayName } = usePriorities();

  const segments = categories
    .map((data) => ({
      data,
      count: getCount(data),
    }))
    .filter((segment) => segment.count > 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...segments.map((segment) => segment.count), 1);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>

      <div className="flex items-end justify-center gap-3 sm:gap-4">
        {segments.map(({ data, count }) => {
          const heightPercent = (count / maxCount) * 100;
          const color = getColor(data.category) ?? "#a1a1aa";

          return (
            <div
              key={data.category}
              className="flex min-w-0 flex-1 max-w-24 flex-col items-center gap-2"
            >
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {count}
              </span>
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: color,
                    minHeight: count > 0 ? "8px" : "0",
                  }}
                  title={`${getDisplayName(data.category)}: ${count}`}
                />
              </div>
              <span className="line-clamp-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {getDisplayName(data.category)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {segments.map(({ data, count }) => (
          <div key={data.category} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor: getColor(data.category) ?? "#a1a1aa",
              }}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {getDisplayName(data.category)} ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
