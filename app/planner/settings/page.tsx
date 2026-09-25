"use client";

import { ClearTasksSection } from "@/features/planner/components/ClearTasksSection";
import { PriorityConfigSection } from "@/features/settings/components/PriorityConfigSection";

export default function PlannerSettingsPage() {
  return (
    <div className="space-y-6">
      <PriorityConfigSection />
      <ClearTasksSection />
    </div>
  );
}
