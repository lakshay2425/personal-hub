"use client";

type PlannerTab = "today" | "backlog" | "upcoming";

interface PlannerTabNavProps {
  activeTab: PlannerTab;
  backlogCount: number;
  onTabChange: (tab: PlannerTab) => void;
}

export function PlannerTabNav({
  activeTab,
  backlogCount,
  onTabChange,
}: PlannerTabNavProps) {
  const tabs: { id: PlannerTab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "backlog", label: `Backlog (${backlogCount})` },
    { id: "upcoming", label: "Upcoming" },
  ];

  return (
    <nav
      aria-label="Planner sections"
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
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export type { PlannerTab };
