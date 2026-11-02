import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getMondayOfWeek, addWeeks, formatWeekRange } from "../lib/weekUtils";
import { getDeleteWarningMessage } from "../lib/deleteTaskMessage";
import {
  buildTaskTree,
  canToggleTaskCompletion,
  collectDescendantIds,
  getDescendantProgress,
} from "../lib/taskTree";
import type { Task } from "../types";

function task(
  id: number,
  parentId: number | null,
  depth: 0 | 1 | 2,
  overrides: Partial<Task> = {},
): Task {
  return {
    id,
    kind: "sprint",
    parentId,
    depth,
    sortOrder: id,
    title: `Task ${id}`,
    status: "Todo",
    completedAt: null,
    notes: "",
    createdAt: id,
    ...overrides,
  };
}

describe("planner task hierarchy", () => {
  it("builds stable sorted trees without changing source tasks", () => {
    const records = [
      task(2, 1, 1),
      task(1, null, 0),
      task(3, 1, 1, { sortOrder: 0 }),
      task(4, 3, 2),
    ];
    const copy = [...records];
    const tree = buildTaskTree(records);
    assert.deepEqual(tree.map(({ id }) => id), [1]);
    assert.deepEqual(tree[0].children.map(({ id }) => id), [3, 2]);
    assert.equal(tree[0].children[0].children[0].id, 4);
    assert.deepEqual(records, copy);
  });

  it("collects descendants and computes completion progress", () => {
    const records = [
      task(1, null, 0),
      task(2, 1, 1, { status: "Done" }),
      task(3, 2, 2),
    ];
    assert.deepEqual(collectDescendantIds(1, records), [2, 3]);
    assert.deepEqual(getDescendantProgress(1, records), { done: 1, total: 2 });
  });

  it("prevents completion toggles for parents and recursive root tasks", () => {
    assert.equal(canToggleTaskCompletion(task(1, null, 0), true), false);
    assert.equal(
      canToggleTaskCompletion(
        task(2, null, 0, { kind: "recursive" }),
        false,
      ),
      false,
    );
    assert.equal(canToggleTaskCompletion(task(3, 1, 1), false), true);
    assert.equal(canToggleTaskCompletion(task(4, null, 0), false), true);
  });

  it("creates accurate delete warnings for leaves, one child, and deep trees", () => {
    assert.match(getDeleteWarningMessage(task(9, null, 0), []), /delete "Task 9"/i);
    assert.match(
      getDeleteWarningMessage(task(1, null, 0), [task(1, null, 0), task(2, 1, 1)]),
      /1 sub-task/,
    );
    assert.match(
      getDeleteWarningMessage(task(1, null, 0), [
        task(1, null, 0),
        task(2, 1, 1),
        task(3, 2, 2),
      ]),
      /2 sub-tasks/,
    );
  });
});

describe("planner week utilities", () => {
  it("normalizes any date to Monday and adds positive or negative weeks", () => {
    assert.equal(getMondayOfWeek(new Date(2026, 5, 3)), "2026-06-01");
    assert.equal(addWeeks("2026-06-01", 2), "2026-06-15");
    assert.equal(addWeeks("2026-06-01", -1), "2026-05-25");
  });

  it("formats a Monday-through-Sunday range", () => {
    assert.equal(formatWeekRange("2026-06-01"), "Mon 01 Jun - Sun 07 Jun");
  });
});
