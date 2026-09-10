"use client";

import Link from "next/link";

import { DataBackupSection } from "@/features/settings/components/DataBackupSection";
import { exportProjectsData } from "@/features/questions/lib/exportRepository";
import {
  importProjectsData,
  validateProjectsBackup,
} from "@/features/questions/lib/importRepository";

export default function ProjectsSettingsPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to Projects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Back up and restore your projects, questions, content ideas, and
          related data.
        </p>
      </div>

      <DataBackupSection
        title="Projects data"
        description="Export or import projects, questions, answers, content ideas, planner tasks, and priority settings."
        filenamePrefix="question-hub-projects"
        onExport={exportProjectsData}
        onValidate={validateProjectsBackup}
        onImport={importProjectsData}
        onImported={() => window.location.reload()}
        className=""
      />
    </div>
  );
}
