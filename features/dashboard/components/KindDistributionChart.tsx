"use client";

import type { KindWeekData } from "../lib/dashboardRepository";

interface KindDistributionChartProps {
  title: string;
  kinds: KindWeekData[];
  getCount: (data: KindWeekData) => number;
  total: number;
  weekTotal: number;
  emptyMessage: string;
}

const KIND_COLORS: Record<KindWeekData["kind"], string> = {
  sprint: "#0284c7",
  recursive: "#7c3aed",
};

function donutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function KindDistributionChart({
  title,
  kinds,
  getCount,
  total,
  weekTotal,
  emptyMessage,
}: KindDistributionChartProps) {
  const segments = kinds
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

  const percentage =
    weekTotal > 0 ? Math.round((total / weekTotal) * 100) : 0;
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 70;
  const innerRadius = 48;

  const slicePaths: {
    data: KindWeekData;
    count: number;
    color: string;
    path: string;
  }[] = [];
  let currentAngle = 0;

  for (const { data, count } of segments) {
    const sliceAngle = (count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    slicePaths.push({
      data,
      count,
      color: KIND_COLORS[data.kind],
      path: donutSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle),
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>

      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slicePaths.map(({ data, count, path, color }) => (
              <path
                key={data.kind}
                d={path}
                fill={color}
                aria-label={`${data.label}: ${count}`}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {percentage}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {total} of {weekTotal}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {segments.map(({ data, count }) => (
          <div key={data.kind} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: KIND_COLORS[data.kind] }}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {data.label} ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
