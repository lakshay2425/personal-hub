"use client";

import type { ReactNode } from "react";

import { useSidebar } from "@/components/SidebarContext";

import { GlobalSearch } from "../components/GlobalSearch";
import { JobSearchSubNav } from "../components/JobSearchSubNav";

export function JobSearchShell({ children }: { children: ReactNode }) {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header
        className={`sticky z-20 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6 ${
          sidebarOpen ? "top-0" : "top-14 lg:top-0"
        }`}
      >
        <div className="flex h-14 items-center sm:h-16">
          <div className="min-w-0 flex-1">
            <GlobalSearch />
          </div>
        </div>
        <div className="pb-4">
          <JobSearchSubNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
