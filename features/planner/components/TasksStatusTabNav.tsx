"use client";

type TasksStatusTab = "pending" | "completed";

interface TasksStatusTabNavProps {
  activeTab: TasksStatusTab;
  onTabChange: (tab: TasksStatusTab) => void;
}

export function TasksStatusTabNav({
  activeTab,
  onTabChange,
}: TasksStatusTabNavProps) {
  const tabs: { id: TasksStatusTab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <nav
      aria-label="Task status"
      className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
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

export type { TasksStatusTab };
