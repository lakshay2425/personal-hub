"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/AppLogo";
import { SITE_NAME } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/projects", label: "Projects" },
  { href: "/content-ideas", label: "Content Ideas" },
  { href: "/logger", label: "Logger" },
  { href: "/job-search", label: "Job Search" },
] as const;

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

interface AppSidebarProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
      ) : null}

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:max-w-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            onClick={onClose}
          >
            <AppLogo className="h-8 w-8" />
            <span className="truncate">{SITE_NAME}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-zinc-200 p-2 transition-colors hover:bg-zinc-50 lg:hidden dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      </aside>
    </>
  );
}
