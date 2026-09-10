"use client";

import { DataBackupSection } from "@/features/settings/components/DataBackupSection";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { exportPeopleData } from "@/features/people/lib/exportRepository";
import {
  importPeopleData,
  validatePeopleBackup,
} from "@/features/people/lib/importRepository";

export default function PeopleSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Back up and restore your discover list and network contacts."
      />

      <DataBackupSection
        title="People data"
        description="Export or import people you are tracking in Discover and Network."
        filenamePrefix="question-hub-people"
        onExport={exportPeopleData}
        onValidate={validatePeopleBackup}
        onImport={importPeopleData}
        onImported={() => window.location.reload()}
        className=""
      />
    </div>
  );
}
