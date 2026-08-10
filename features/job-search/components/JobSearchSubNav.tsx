"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavItems } from "../constants";
import { useJobSearchPreferences } from "../hooks/useJobSearchPreferences";

export function JobSearchSubNav() {
  const pathname = usePathname();
  const { showApplications } = useJobSearchPreferences();
  const navItems = getNavItems(showApplications);

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 pb-3 sm:mx-0 sm:px-0 dark:border-zinc-800">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
