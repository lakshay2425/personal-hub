import { getDB } from "../db";
import { getCurrentWeekStart } from "../lib/dateUtils";
import type {
  LeadTouchpoint,
  WeeklyTargetCategory,
  WeeklyTargetSettings,
} from "../types";

export const WEEKLY_TARGET_SETTINGS_ID = 1 as const;

export const WEEKLY_TARGET_CATEGORIES: {
  id: WeeklyTargetCategory;
  label: string;
}[] = [
  { id: "applications", label: "Portal applications" },
  { id: "emails", label: "Emails sent" },
  { id: "linkedinMessages", label: "LinkedIn messages" },
  { id: "linkedinConnections", label: "LinkedIn connection requests" },
];

export function createDefaultWeeklyTargetSettings(): WeeklyTargetSettings {
  return {
    id: WEEKLY_TARGET_SETTINGS_ID,
    combinedEnabled: false,
    combinedTarget: 50,
    combinedCategories: ["emails", "linkedinMessages", "linkedinConnections"],
    categoryTargets: {
      applications: { enabled: false, target: 10 },
      emails: { enabled: false, target: 10 },
      linkedinMessages: { enabled: false, target: 10 },
      linkedinConnections: { enabled: false, target: 10 },
    },
  };
}

export async function getWeeklyTargetSettings(): Promise<WeeklyTargetSettings> {
  const db = getDB();
  return (await db.weeklyTargetSettings.get(WEEKLY_TARGET_SETTINGS_ID)) ??
    createDefaultWeeklyTargetSettings();
}

export async function saveWeeklyTargetSettings(
  settings: WeeklyTargetSettings,
): Promise<void> {
  if (
    (settings.combinedEnabled &&
      (!Number.isInteger(settings.combinedTarget) ||
        settings.combinedTarget < 1 ||
        settings.combinedCategories.length === 0)) ||
    Object.values(settings.categoryTargets).some(
      (target) =>
        target.enabled &&
        (!Number.isInteger(target.target) || target.target < 1),
    )
  ) {
    throw new Error("Enabled targets must be positive whole numbers.");
  }
  await getDB().weeklyTargetSettings.put({
    ...settings,
    id: WEEKLY_TARGET_SETTINGS_ID,
    combinedCategories: [...new Set(settings.combinedCategories)],
  });
}

export interface WeeklyGoalProgress {
  id: string;
  label: string;
  target: number;
  count: number;
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isCategoryTouchpoint(
  touchpoint: LeadTouchpoint,
  category: WeeklyTargetCategory,
): boolean {
  if (touchpoint.status !== "Sent") return false;
  if (category === "emails") {
    return (
      touchpoint.channel === "Email" &&
      ["Initial", "Message", "Follow-up", "First Follow-up", "Second Follow-up"].includes(
        touchpoint.type,
      )
    );
  }
  if (category === "linkedinConnections") {
    return (
      touchpoint.channel === "LinkedIn" &&
      touchpoint.type === "Connection Request"
    );
  }
  return (
    category === "linkedinMessages" &&
    touchpoint.channel === "LinkedIn" &&
    ["Message", "Follow-up"].includes(touchpoint.type)
  );
}

export async function getWeeklyGoalProgress(): Promise<{
  settings: WeeklyTargetSettings;
  goals: WeeklyGoalProgress[];
  weekStart: string;
}> {
  const db = getDB();
  const [settings, applications, touchpoints] = await Promise.all([
    getWeeklyTargetSettings(),
    db.applications.toArray(),
    db.leadTouchpoints.toArray(),
  ]);
  const weekStart = getCurrentWeekStart();
  const today = localDateString(new Date());
  const dayCounts: Record<WeeklyTargetCategory, number> = {
    applications: applications.filter(
      (application) =>
        application.appliedDate >= weekStart &&
        application.appliedDate <= today,
    ).length,
    emails: 0,
    linkedinMessages: 0,
    linkedinConnections: 0,
  };
  for (const category of [
    "emails",
    "linkedinMessages",
    "linkedinConnections",
  ] as const) {
    dayCounts[category] = touchpoints.filter(
      (touchpoint) =>
        isCategoryTouchpoint(touchpoint, category) &&
        localDateString(new Date(touchpoint.occurredAt)) >= weekStart &&
        localDateString(new Date(touchpoint.occurredAt)) <= today,
    ).length;
  }

  const goals: WeeklyGoalProgress[] = [];
  if (settings.combinedEnabled) {
    goals.push({
      id: "combined",
      label: `Combined (${settings.combinedCategories
        .map(
          (category) =>
            WEEKLY_TARGET_CATEGORIES.find((item) => item.id === category)
              ?.label,
        )
        .join(" + ")})`,
      target: settings.combinedTarget,
      count: settings.combinedCategories.reduce(
        (sum, category) => sum + dayCounts[category],
        0,
      ),
    });
  }
  for (const category of WEEKLY_TARGET_CATEGORIES) {
    const target = settings.categoryTargets[category.id];
    if (target.enabled) {
      goals.push({
        id: category.id,
        label: category.label,
        target: target.target,
        count: dayCounts[category.id],
      });
    }
  }
  return { settings, goals, weekStart };
}
