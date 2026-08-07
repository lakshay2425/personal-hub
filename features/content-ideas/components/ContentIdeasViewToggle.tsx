"use client";

import type { ContentIdeasViewMode } from "../types";

export type { ContentIdeasViewMode };

interface ContentIdeasViewToggleProps {
  value: ContentIdeasViewMode;
  onChange: (mode: ContentIdeasViewMode) => void;
  className?: string;
}

function TableIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16M8 6h.01M8 12h.01M8 18h.01"
      />
    </svg>
  );
}

const OPTIONS: {
  mode: ContentIdeasViewMode;
  label: string;
  icon: typeof TableIcon;
}[] = [
  { mode: "list", label: "List", icon: ListIcon },
  { mode: "table", label: "Table", icon: TableIcon },
  { mode: "cards", label: "Cards", icon: CardsIcon },
];

export function ContentIdeasViewToggle({
  value,
  onChange,
  className,
}: ContentIdeasViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className={`inline-flex w-full shrink-0 justify-center rounded-lg border border-zinc-300 bg-white p-1 sm:w-auto sm:justify-start dark:border-zinc-600 dark:bg-zinc-800 ${className ?? ""}`}
    >
      {OPTIONS.map(({ mode, label, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <Icon />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
