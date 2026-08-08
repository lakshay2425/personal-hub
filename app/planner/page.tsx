"use client";

import { PlannerWorkspace } from "@/features/planner/components/PlannerWorkspace";

export default function PlannerPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <PlannerWorkspace />
    </div>
  );
}
