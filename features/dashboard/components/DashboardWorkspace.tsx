"use client";

import { useEffect, useState } from "react";

import { WeekNavigation } from "@/features/planner/components/WeekNavigation";
import { getCurrentWeekStart } from "@/features/planner/lib/weekUtils";

import {
  getDashboardWeekData,
  type DashboardWeekData,
} from "../lib/dashboardRepository";
import { KindDistributionChart } from "./KindDistributionChart";
import { PriorityWeekRow } from "./PriorityWeekRow";

export function DashboardWorkspace() {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);
  const [data, setData] = useState<DashboardWeekData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const weekData = await getDashboardWeekData(weekStart);
        if (!cancelled) {
          setData(weekData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  if (isLoading) {
    return (
      <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    );
  }

  if (!data) {
    return null;
  }

  const totalLogs = data.categories.reduce(
    (sum, category) => sum + category.logEntries.length,
    0,
  );
  const activeAreas = data.categories.filter(
    (category) => category.logEntries.length > 0,
  ).length;
  const taskWeekTotal = data.totalOpenRoots + data.totalCompletedThisWeek;

  return (
    <div className="space-y-6">
      <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />

      <div className="grid gap-6 lg:grid-cols-2">
        <KindDistributionChart
          title="Open tasks"
          kinds={data.kinds}
          getCount={(kindData) => kindData.openRoots.length}
          total={data.totalOpenRoots}
          weekTotal={taskWeekTotal}
          emptyMessage="No open sprint or recursive tasks."
        />
        <KindDistributionChart
          title="Completed this week"
          kinds={data.kinds}
          getCount={(kindData) => kindData.completedThisWeek.length}
          total={data.totalCompletedThisWeek}
          weekTotal={taskWeekTotal}
          emptyMessage="No completed sprint or recursive tasks this week."
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Activity by log category
        </h3>
        {totalLogs > 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {totalLogs} log{totalLogs === 1 ? "" : "s"} this week across{" "}
            {activeAreas} area{activeAreas === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No log entries this week yet.
          </p>
        )}
        {data.categories.map((categoryData) => (
          <PriorityWeekRow
            key={categoryData.category}
            data={categoryData}
            weekTotal={totalLogs}
          />
        ))}
      </div>
    </div>
  );
}
