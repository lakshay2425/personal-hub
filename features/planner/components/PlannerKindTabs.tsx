"use client";

import type { TaskKind } from "../types";

export type PlannerKindTab = TaskKind;

interface PlannerKindTabsProps {
  activeTab: PlannerKindTab;
  inboxCount: number;
  sprintCount: number;
  iterativeCount: number;
  onTabChange: (tab: PlannerKindTab) => void;
}

export function PlannerKindTabs({
  activeTab,
  inboxCount,
  sprintCount,
  iterativeCount,
  onTabChange,
}: PlannerKindTabsProps) {
  const tabs: { id: PlannerKindTab; label: string; count: number }[] = [
    { id: "inbox", label: "Inbox", count: inboxCount },
    { id: "sprint", label: "Sprint", count: sprintCount },
    { id: "recursive", label: "Iterative", count: iterativeCount },
  ];

  return (
    <nav
      aria-label="Task lists"
      className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </nav>
  );
}
