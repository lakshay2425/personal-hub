import type {
  DiscoverStatus,
  PeoplePlatform,
  RelationshipType,
} from "./types";

export const PEOPLE_NAV_ITEMS = [
  { href: "/people/discover", label: "Discover" },
  { href: "/people/network", label: "Network" },
  { href: "/people/settings", label: "Settings", exact: true },
] as const;

export const PEOPLE_PLATFORMS: PeoplePlatform[] = [
  "LinkedIn",
  "X",
  "Instagram",
  "YouTube",
  "Other",
];

export const DEFAULT_PEOPLE_PLATFORM: PeoplePlatform = "LinkedIn";

export const DISCOVER_STATUSES: DiscoverStatus[] = [
  "To review",
  "Following",
  "Passed",
  "Maybe later",
];

export const DEFAULT_DISCOVER_STATUS: DiscoverStatus = "To review";

export const DISCOVER_STATUS_PRIORITY: Record<DiscoverStatus, number> = {
  "To review": 0,
  "Maybe later": 1,
  Following: 2,
  Passed: 3,
};

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Colleague",
  "Friend",
  "Met in person",
  "Online",
  "Other",
];

export const DEFAULT_RELATIONSHIP_TYPE: RelationshipType = "Online";

export function isPeoplePlatform(value: unknown): value is PeoplePlatform {
  return PEOPLE_PLATFORMS.includes(value as PeoplePlatform);
}

export function isDiscoverStatus(value: unknown): value is DiscoverStatus {
  return DISCOVER_STATUSES.includes(value as DiscoverStatus);
}

export function isRelationshipType(value: unknown): value is RelationshipType {
  return RELATIONSHIP_TYPES.includes(value as RelationshipType);
}

export function isValidProfileUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}
