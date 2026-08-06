"use client";

import type { ReactNode } from "react";

import { GlobalSearch } from "../components/GlobalSearch";
import { Sidebar } from "../components/Sidebar";

export function JobSearchShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 lg:pl-6">
          <div className="ml-12 flex-1 lg:ml-0">
            <GlobalSearch />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
