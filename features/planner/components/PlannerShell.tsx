"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TOP_NAV_ITEMS = [
  { href: "/planner", label: "Tasks", exact: true },
  { href: "/planner/logger", label: "Logger", prefix: "/planner/logger" },
  { href: "/planner/dashboard", label: "Dashboard", exact: true },
  { href: "/planner/settings", label: "Settings", exact: true },
] as const;

const LOGGER_NAV_ITEMS = [
  { href: "/planner/logger", label: "All Entries", exact: true },
  { href: "/planner/logger/daily", label: "By Date", exact: true },
] as const;

function isActive(
  pathname: string,
  href: string,
  exact?: boolean,
  prefix?: string,
): boolean {
  if (prefix) {
    return pathname.startsWith(prefix);
  }
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export function PlannerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showLoggerSubNav = pathname.startsWith("/planner/logger");

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Planner
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Plan your week, log your progress, and track activity by priority.
          </p>
        </div>

        <nav className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50">
          {TOP_NAV_ITEMS.map((item) => {
            const active = isActive(
              pathname,
              item.href,
              "exact" in item ? item.exact : false,
              "prefix" in item ? item.prefix : undefined,
            );

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

        {showLoggerSubNav ? (
          <nav className="mt-2 flex gap-1 overflow-x-auto">
            {LOGGER_NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>

      {children}
    </div>
  );
}
