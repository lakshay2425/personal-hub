import {
  isPeoplePlatform,
  isRelationshipType,
} from "../constants";
import type { NetworkPerson } from "../types";

export function matchesNetworkQuery(
  person: NetworkPerson,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    person.name,
    person.howWeKnow,
    person.metAt,
    person.notes,
    person.profileUrl,
    person.platform,
    person.relationshipType,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function sortNetworkPeople(people: NetworkPerson[]): NetworkPerson[] {
  return [...people].sort((a, b) => {
    const nameDelta = a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    });
    if (nameDelta !== 0) return nameDelta;
    return b.createdAt - a.createdAt;
  });
}

export function normalizeNetworkPerson(
  data: Pick<
    NetworkPerson,
    | "name"
    | "platform"
    | "profileUrl"
    | "relationshipType"
    | "howWeKnow"
    | "metAt"
    | "notes"
  >,
): Pick<
  NetworkPerson,
  | "name"
  | "platform"
  | "profileUrl"
  | "relationshipType"
  | "howWeKnow"
  | "metAt"
  | "notes"
> {
  return {
    name: data.name.trim(),
    platform: isPeoplePlatform(data.platform) ? data.platform : "LinkedIn",
    profileUrl: data.profileUrl.trim(),
    relationshipType: isRelationshipType(data.relationshipType)
      ? data.relationshipType
      : "Online",
    howWeKnow: data.howWeKnow.trim(),
    metAt: data.metAt.trim(),
    notes: data.notes.trim(),
  };
}
