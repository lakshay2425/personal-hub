"use client";

import type { ReactNode } from "react";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { useSidebar } from "@/components/SidebarContext";

import { GlobalSearch } from "../components/GlobalSearch";
import { JobSearchSubNav } from "../components/JobSearchSubNav";
import { exportJobSearchData } from "../repositories/exportRepository";
import {
  importJobSearchData,
  validateJobSearchBackup,
} from "../repositories/importRepository";

export function JobSearchShell({ children }: { children: ReactNode }) {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header
        className={`sticky z-20 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 ${
          sidebarOpen ? "top-0" : "top-14 lg:top-0"
        }`}
      >
        <div className="flex h-14 items-center gap-3 sm:h-16">
          <div className="min-w-0 flex-1">
            <GlobalSearch />
          </div>
          <ExportButton
            onExport={exportJobSearchData}
            filenamePrefix="question-hub-job-search"
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          />
          <ImportButton
            onValidate={validateJobSearchBackup}
            onImport={importJobSearchData}
            onImported={() => window.location.reload()}
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          />
        </div>
        <div className="pb-4">
          <JobSearchSubNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
