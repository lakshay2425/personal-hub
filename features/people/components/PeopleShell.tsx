"use client";

import type { ReactNode } from "react";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { useSidebar } from "@/components/SidebarContext";

import { exportPeopleData } from "../lib/exportRepository";
import {
  importPeopleData,
  validatePeopleBackup,
} from "../lib/importRepository";
import { PeopleSubNav } from "./PeopleSubNav";

export function PeopleShell({ children }: { children: ReactNode }) {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header
        className={`sticky z-20 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 ${
          sidebarOpen ? "top-0" : "top-14 lg:top-0"
        }`}
      >
        <div className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:py-0">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              People
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review people to follow and keep context on people you know.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <ExportButton
              onExport={exportPeopleData}
              filenamePrefix="question-hub-people"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            />
            <ImportButton
              onValidate={validatePeopleBackup}
              onImport={importPeopleData}
              onImported={() => window.location.reload()}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            />
          </div>
        </div>
        <div className="pb-4">
          <PeopleSubNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
