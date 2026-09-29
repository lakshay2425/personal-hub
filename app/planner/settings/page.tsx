"use client";

import { ClearTasksSection } from "@/features/planner/components/ClearTasksSection";
import {
  exportPlannerData,
  importPlannerData,
  validatePlannerBackup,
} from "@/features/planner/lib/backupRepository";
import { DataBackupSection } from "@/features/settings/components/DataBackupSection";
import { PriorityConfigSection } from "@/features/settings/components/PriorityConfigSection";

export default function PlannerSettingsPage() {
  return (
    <div className="space-y-6">
      <DataBackupSection
        title="Planner data"
        description="Export or import planner tasks, task activity history, and priority settings."
        filenamePrefix="question-hub-planner"
        onExport={exportPlannerData}
        onValidate={validatePlannerBackup}
        onImport={importPlannerData}
        onImported={() => window.location.reload()}
        importConfirmMessage="This will replace existing planner tasks, task activity history, and priority settings. Other app data stays unchanged."
        className=""
      />
      <PriorityConfigSection />
      <ClearTasksSection />
    </div>
  );
}
