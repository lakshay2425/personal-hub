"use client";

import { useEffect, useState } from "react";

import { WeekNavigation } from "@/features/planner/components/WeekNavigation";
import { getCurrentWeekStart } from "@/features/planner/lib/weekUtils";

import {
  getDashboardWeekData,
  type DashboardWeekData,
} from "../lib/dashboardRepository";
import { PriorityWeekRow } from "./PriorityWeekRow";
import { WeekDistributionBar } from "./WeekDistributionBar";

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

  return (
    <div className="space-y-6">
      <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />

      <WeekDistributionBar
        categories={data.categories}
        totalCompletedTasks={data.totalCompletedTasks}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Activity by priority
        </h3>
        {data.categories.map((categoryData) => (
          <PriorityWeekRow key={categoryData.category} data={categoryData} />
        ))}
      </div>
    </div>
  );
}
