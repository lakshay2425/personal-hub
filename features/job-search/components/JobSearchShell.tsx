"use client";

import type { ReactNode } from "react";

import { GlobalSearch } from "../components/GlobalSearch";
import { JobSearchSubNav } from "../components/JobSearchSubNav";

export function JobSearchShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 lg:pl-6">
        <div className="ml-12 flex h-16 items-center lg:ml-0">
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </div>
        <div className="ml-12 pb-4 lg:ml-0">
          <JobSearchSubNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
