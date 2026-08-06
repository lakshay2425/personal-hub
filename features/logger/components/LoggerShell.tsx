"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { exportLoggerData } from "@/features/logger/lib/exportRepository";
import {
  importLoggerData,
  validateLoggerBackup,
} from "@/features/logger/lib/importRepository";

const NAV_ITEMS = [
  { href: "/logger", label: "Log", exact: true },
  { href: "/logger/dashboard", label: "Dashboard", exact: true },
] as const;

export function LoggerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Logger
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Log what you did — multiple entries per day, stored locally in
              IndexedDB.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <ExportButton
              onExport={exportLoggerData}
              filenamePrefix="question-hub-logger"
              className="w-full shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            />
            <ImportButton
              onValidate={validateLoggerBackup}
              onImport={importLoggerData}
              onImported={() => window.location.reload()}
              className="w-full shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            />
          </div>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
