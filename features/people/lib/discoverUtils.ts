import { isTimestampInWeek } from "@/features/job-search/lib/dateUtils";

import { DISCOVER_STATUS_PRIORITY, isDiscoverStatus, isPeoplePlatform } from "../constants";
import type { DiscoverPerson, DiscoverStatus } from "../types";

export function matchesDiscoverQuery(
  person: DiscoverPerson,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    person.name,
    person.whySaved,
    person.notes,
    person.profileUrl,
    person.platform,
    person.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function sortDiscoverPeople(people: DiscoverPerson[]): DiscoverPerson[] {
  return [...people].sort((a, b) => {
    const statusDelta =
      DISCOVER_STATUS_PRIORITY[a.status] - DISCOVER_STATUS_PRIORITY[b.status];
    if (statusDelta !== 0) return statusDelta;
    return b.createdAt - a.createdAt;
  });
}

export function isDiscoverPersonInWeek(
  person: DiscoverPerson,
  weekStart: string,
): boolean {
  return isTimestampInWeek(person.createdAt, weekStart);
}

export function reviewedAtForStatus(status: DiscoverStatus): number | null {
  return status === "To review" ? null : Date.now();
}

export function normalizeDiscoverPerson(
  data: Pick<
    DiscoverPerson,
    "name" | "platform" | "profileUrl" | "whySaved" | "status" | "notes"
  >,
): Pick<
  DiscoverPerson,
  "name" | "platform" | "profileUrl" | "whySaved" | "status" | "notes"
> {
  return {
    name: data.name.trim(),
    platform: isPeoplePlatform(data.platform) ? data.platform : "LinkedIn",
    profileUrl: data.profileUrl.trim(),
    whySaved: data.whySaved.trim(),
    status: isDiscoverStatus(data.status) ? data.status : "To review",
    notes: data.notes.trim(),
  };
}
