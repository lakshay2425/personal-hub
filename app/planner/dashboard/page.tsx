"use client";

import { DashboardWorkspace } from "@/features/dashboard/components/DashboardWorkspace";

export default function PlannerDashboardPage() {
  return (
    <>
      <div
        role="status"
        className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
      >
        <p className="text-sm font-semibold">Coming Soon</p>
        <p className="mt-1 text-sm">
          The planner dashboard will be revamped soon.
        </p>
      </div>
      <DashboardWorkspace />
    </>
  );
}
