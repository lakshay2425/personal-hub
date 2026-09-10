"use client";

import { DataBackupSection } from "@/features/settings/components/DataBackupSection";
import { exportLoggerData } from "@/features/logger/lib/exportRepository";
import {
  importLoggerData,
  validateLoggerBackup,
} from "@/features/logger/lib/importRepository";

export default function LoggerSettingsPage() {
  return (
    <DataBackupSection
      title="Logger data"
      description="Export or import your daily log entries."
      filenamePrefix="question-hub-logger"
      onExport={exportLoggerData}
      onValidate={validateLoggerBackup}
      onImport={importLoggerData}
      onImported={() => window.location.reload()}
      className=""
    />
  );
}
