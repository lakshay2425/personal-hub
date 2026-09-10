"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const PLANNER_NAV_ITEMS = [
  { href: "/planner", label: "Tasks", exact: true },
  { href: "/planner/dashboard", label: "Dashboard", exact: true },
  { href: "/planner/settings", label: "Settings", exact: true },
] as const;

const LOGGER_NAV_ITEMS = [
  { href: "/planner/logger", label: "All Entries", exact: true },
  { href: "/planner/logger/daily", label: "By Date", exact: true },
  { href: "/planner/logger/settings", label: "Settings", exact: true },
] as const;

function isActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export function PlannerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoggerRoute = pathname.startsWith("/planner/logger");

  return (
    <div className="mx-auto min-h-full w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isLoggerRoute ? "Logger" : "Planner"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isLoggerRoute
              ? "Record and review your daily activity log."
              : "Plan your week and track activity by priority."}
          </p>
        </div>

        {isLoggerRoute ? (
          <nav
            aria-label="Logger sections"
            className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            {LOGGER_NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav
            aria-label="Planner sections"
            className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            {PLANNER_NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {children}
    </div>
  );
}
