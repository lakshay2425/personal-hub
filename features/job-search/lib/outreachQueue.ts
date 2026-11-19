import type { Lead } from "../types";

export interface OutreachQueueGroup {
  title: string;
  leads: Lead[];
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getOutreachQueueGroups(
  leads: Lead[],
  now = new Date(),
): OutreachQueueGroup[] {
  const queued = leads
    .filter((lead) => Boolean(lead.nextFollowUpDate))
    .sort((a, b) => (a.nextFollowUpDate ?? "").localeCompare(b.nextFollowUpDate ?? ""));
  const todayKey = localDateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = localDateKey(tomorrow);
  const groups: OutreachQueueGroup[] = [
    { title: "Missed", leads: queued.filter((lead) => lead.nextFollowUpDate! < todayKey) },
    { title: "Today", leads: queued.filter((lead) => lead.nextFollowUpDate === todayKey) },
    { title: "Tomorrow", leads: queued.filter((lead) => lead.nextFollowUpDate === tomorrowKey) },
  ];

  const futureDates = [...new Set(queued
    .map((lead) => lead.nextFollowUpDate)
    .filter((date): date is string => Boolean(date) && date! > tomorrowKey))];
  for (const date of futureDates) {
    groups.push({
      title: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      leads: queued.filter((lead) => lead.nextFollowUpDate === date),
    });
  }

  return groups.filter((group) => group.leads.length > 0);
}
