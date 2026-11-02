import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildContentIdeaTree,
  canMoveToRoot,
  collectDescendantIds,
  countAllDescendants,
  getValidParentTargets,
  isDescendantOf,
  truncateTitle,
} from "../lib/contentIdeaTree";
import {
  getMonthGridDays,
  getWeekDays,
  parseDateString,
  toDateString,
} from "../lib/calendarDateUtils";
import type { ContentIdea } from "../types";

function idea(
  id: number,
  parentId: number | null,
  depth: 0 | 1 | 2,
  sortOrder = 0,
): ContentIdea {
  return {
    id,
    projectId: null,
    parentId,
    depth,
    sortOrder,
    title: `Idea ${id}`,
    status: "Draft",
    contentType: "Post",
    publishedLinks: { linkedin: "", twitter: "", blog: "", other: "" },
    notes: "",
    scheduledDate: null,
    createdAt: id,
  };
}

describe("content idea hierarchy", () => {
  it("builds ordered trees without mutating the source array", () => {
    const ideas = [
      idea(3, 1, 1, 2),
      idea(1, null, 0, 0),
      idea(2, null, 0, 1),
      idea(4, 3, 2),
    ];
    const original = [...ideas];
    const tree = buildContentIdeaTree(ideas);

    assert.deepEqual(tree.map(({ id }) => id), [1, 2]);
    assert.deepEqual(tree[0].children.map(({ id }) => id), [3]);
    assert.equal(tree[0].children[0].children[0].id, 4);
    assert.deepEqual(ideas, original);
    assert.equal(countAllDescendants(tree[0]), 2);
  });

  it("collects descendant IDs and identifies descendants", () => {
    const ideas = [idea(1, null, 0), idea(2, 1, 1), idea(3, 2, 2)];
    assert.deepEqual(collectDescendantIds(1, ideas), [2, 3]);
    assert.equal(isDescendantOf(1, 3, ideas), true);
    assert.equal(isDescendantOf(3, 1, ideas), false);
  });

  it("prevents reparenting to self, descendants, or a target exceeding max depth", () => {
    const ideas = [
      idea(1, null, 0),
      idea(2, 1, 1),
      idea(3, 2, 2),
      idea(4, null, 0),
      idea(5, null, 2),
    ];
    const targets = getValidParentTargets(2, ideas).map(({ id }) => id);
    assert.deepEqual(targets, [1, 4]);
    assert.equal(canMoveToRoot(2, ideas), true);
    assert.equal(canMoveToRoot(1, ideas), false);
  });

  it("handles missing ideas and truncates titles only beyond the limit", () => {
    assert.deepEqual(getValidParentTargets(999, [idea(1, null, 0)]), []);
    assert.equal(canMoveToRoot(999, []), false);
    assert.equal(truncateTitle("short", 5), "short");
    assert.equal(truncateTitle("longer", 5), "longe…");
    assert.equal(truncateTitle("longer", 0), "…");
  });
});

describe("content calendar date utilities", () => {
  it("parses and formats local dates without changing the calendar day", () => {
    assert.equal(toDateString(parseDateString("2026-03-08")), "2026-03-08");
  });

  it("returns seven days for a week grid", () => {
    const days = getWeekDays(parseDateString("2026-06-03"));
    assert.equal(days.length, 7);
    assert.deepEqual(
      [toDateString(days[0]), toDateString(days[6])],
      ["2026-05-31", "2026-06-06"],
    );
  });

  it("returns complete calendar weeks for a month grid", () => {
    const days = getMonthGridDays(parseDateString("2026-02-15"));
    assert.equal(days.length % 7, 0);
    assert.equal(days[0].getDay(), 0);
    assert.equal(days.at(-1)?.getDay(), 6);
    assert.equal(days.some((day) => toDateString(day) === "2026-02-15"), true);
  });
});
