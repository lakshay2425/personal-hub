"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/job-search/outreach", label: "Job Outreach", exact: true },
  {
    href: "/job-search/outreach/product",
    label: "Product Outreach",
    exact: false,
  },
] as const;

function isTabActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OutreachTabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Outreach sections"
      className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
    >
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href, tab.exact);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
