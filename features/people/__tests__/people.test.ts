import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  matchesDiscoverQuery,
  normalizeDiscoverPerson,
  sortDiscoverPeople,
} from "../lib/discoverUtils";
import {
  matchesNetworkQuery,
  normalizeNetworkPerson,
  sortNetworkPeople,
} from "../lib/networkUtils";
import type { DiscoverPerson, NetworkPerson } from "../types";

function discoverPerson(
  id: number,
  status: DiscoverPerson["status"],
  createdAt: number,
  overrides: Partial<DiscoverPerson> = {},
): DiscoverPerson {
  return {
    id,
    name: `Person ${id}`,
    platform: "LinkedIn",
    profileUrl: "https://linkedin.com/in/person",
    whySaved: "Interesting posts",
    status,
    notes: "",
    createdAt,
    updatedAt: createdAt,
    reviewedAt: null,
    ...overrides,
  };
}

function networkPerson(
  id: number,
  name: string,
  createdAt: number,
): NetworkPerson {
  return {
    id,
    name,
    platform: "LinkedIn",
    profileUrl: "https://linkedin.com/in/person",
    relationshipType: "Online",
    howWeKnow: "Shared interest",
    metAt: "",
    notes: "",
    createdAt,
    updatedAt: createdAt,
  };
}

describe("people discovery", () => {
  it("searches case-insensitively across saved fields and accepts an empty query", () => {
    const person =     discoverPerson(1, "Following", 1, {
      whySaved: "Great engineering writing",
    });
    assert.equal(matchesDiscoverQuery(person, " GREAT engineering "), true);
    assert.equal(matchesDiscoverQuery(person, "not present"), false);
    assert.equal(matchesDiscoverQuery(person, "   "), true);
  });

  it("sorts by status priority and then newest first without mutating", () => {
    const people = [
      discoverPerson(1, "To review", 1),
      discoverPerson(2, "To review", 2),
      discoverPerson(3, "Following", 100),
      discoverPerson(4, "Passed", 200),
    ];
    const sorted = sortDiscoverPeople(people);
    assert.deepEqual(
      sorted.map(({ id }) => id),
      [2, 1, 3, 4],
    );
    assert.equal(people[0].id, 1);
  });

  it("normalizes whitespace and falls back from invalid platform or status", () => {
    assert.deepEqual(
      normalizeDiscoverPerson({
        name: " Ada ",
        platform: "invalid" as DiscoverPerson["platform"],
        profileUrl: " https://example.com/ada ",
        whySaved: " reason ",
        status: "invalid" as DiscoverPerson["status"],
        notes: " note ",
      }),
      {
        name: "Ada",
        platform: "LinkedIn",
        profileUrl: "https://example.com/ada",
        whySaved: "reason",
        status: "To review",
        notes: "note",
      },
    );
  });
});

describe("people network", () => {
  it("searches case-insensitively across relationship fields", () => {
    const person = networkPerson(1, "Casey", 1);
    assert.equal(matchesNetworkQuery(person, " shared INTEREST "), true);
    assert.equal(matchesNetworkQuery(person, "missing"), false);
    assert.equal(matchesNetworkQuery(person, ""), true);
  });

  it("sorts names case-insensitively and uses newest records as tie-breaker", () => {
    const people = [
      networkPerson(1, "zoe", 1),
      networkPerson(2, "Amy", 1),
      networkPerson(3, "amy", 3),
    ];
    assert.deepEqual(
      sortNetworkPeople(people).map(({ id }) => id),
      [3, 2, 1],
    );
  });

  it("normalizes network fields and defaults invalid platform or relationship", () => {
    assert.deepEqual(
      normalizeNetworkPerson({
        name: "  Sam ",
        platform: "Invalid" as NetworkPerson["platform"],
        profileUrl: " https://x.com/sam ",
        relationshipType: "Invalid" as NetworkPerson["relationshipType"],
        howWeKnow: " coworker ",
        metAt: " event ",
        notes: " note ",
      }),
      {
        name: "Sam",
        platform: "LinkedIn",
        profileUrl: "https://x.com/sam",
        relationshipType: "Online",
        howWeKnow: "coworker",
        metAt: "event",
        notes: "note",
      },
    );
  });
});
