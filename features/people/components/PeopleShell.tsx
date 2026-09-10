"use client";

import type { ReactNode } from "react";

import { useSidebar } from "@/components/SidebarContext";

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
        </div>
        <div className="pb-4">
          <PeopleSubNav />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
