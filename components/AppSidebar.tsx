"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/AppLogo";
import { SITE_NAME } from "@/lib/site";

type NavLink = {
  href: string;
  label: string;
};

type NavGroup = {
  label: string;
  href: string;
  children: NavLink[];
};

type NavItem = NavLink | NavGroup;

function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/projects", label: "Projects" },
  {
    label: "Content Ideas",
    href: "/content-ideas",
    children: [
      { href: "/content-ideas", label: "Ideas" },
      { href: "/content-ideas/calendar", label: "Calendar" },
    ],
  },
  { href: "/planner", label: "Planner" },
  { href: "/logger", label: "Logger" },
  { href: "/job-search", label: "Job Search" },
];

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

function NavLinkItem({
  href,
  label,
  pathname,
  onClose,
  nested = false,
}: {
  href: string;
  label: string;
  pathname: string;
  onClose: () => void;
  nested?: boolean;
}) {
  const isActive =
    href === "/content-ideas"
      ? pathname === "/content-ideas"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`block rounded-lg py-2 text-sm font-medium transition-colors ${
        nested ? "pl-6 pr-3" : "px-3"
      } ${
        isActive
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
      }`}
    >
      {label}
    </Link>
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
            if (isNavGroup(item)) {
              const isGroupActive = item.children.some((child) =>
                child.href === "/content-ideas"
                  ? pathname === "/content-ideas"
                  : pathname.startsWith(child.href),
              );

              return (
                <div key={item.href} className="space-y-0.5">
                  <p
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                      isGroupActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <NavLinkItem
                      key={child.href}
                      href={child.href}
                      label={child.label}
                      pathname={pathname}
                      onClose={onClose}
                      nested
                    />
                  ))}
                </div>
              );
            }

            return (
              <NavLinkItem
                key={item.href}
                href={item.href}
                label={item.label}
                pathname={pathname}
                onClose={onClose}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}
