export interface PriorityArea {
  name: string;
  color: string;
}

export interface PrioritiesSettings {
  key: "priorities";
  slots: (PriorityArea | null)[];
}

export const UNASSIGNED = "unassigned" as const;

export const PRIORITY_SLOT_COUNT = 4;

export const DEFAULT_PRIORITY_SLOTS: (PriorityArea | null)[] = [
  { name: "Outreach", color: "#3b82f6" },
  { name: "Interview Prep", color: "#8b5cf6" },
  { name: "Project Building", color: "#10b981" },
  null,
];

export const PRESET_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#6366f1",
] as const;
