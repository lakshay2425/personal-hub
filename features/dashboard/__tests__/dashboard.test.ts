import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDashboardWeekData } from "../lib/dashboardRepository";
import type { LogEntry } from "@/features/logger/types";
import type { Task } from "@/features/planner/types";
import type { PrioritiesSettings } from "@/features/settings/types";

const weekStart = "2026-06-01";

function task(
  id: number,
  kind: Task["kind"],
  parentId: number | null,
  status: Task["status"],
  completedAt: number | null,
): Task {
  return {
    id,
    kind,
    parentId,
    depth: parentId === null ? 0 : 1,
    sortOrder: id,
    title: `Task ${id}`,
    status,
    completedAt,
    notes: "",
    createdAt: id,
  };
}

function log(id: string, date: string, category?: string): LogEntry {
  return {
    id,
    date,
    text: `Log ${id}`,
    category,
    createdAt: 1,
    updatedAt: 1,
  };
}

const priorities: PrioritiesSettings = {
  key: "priorities",
  slots: [
    { name: "Outreach", color: "#000000" },
    { name: "Build", color: "#ffffff" },
    null,
    null,
  ],
};

describe("weekly dashboard aggregation", () => {
  it("counts open roots and completions in the selected Monday-Sunday week", () => {
    const data = buildDashboardWeekData(
      weekStart,
      [
        task(1, "sprint", null, "Todo", null),
        task(2, "sprint", 1, "Todo", null),
        task(3, "recursive", null, "Todo", null),
        task(4, "sprint", null, "Done", Date.UTC(2026, 5, 1, 0)),
        task(5, "recursive", null, "Done", Date.UTC(2026, 5, 7, 23)),
        task(6, "sprint", null, "Done", Date.UTC(2026, 4, 31, 23)),
        task(7, "sprint", null, "Done", Date.UTC(2026, 5, 8)),
      ],
      [],
      priorities,
    );

    assert.equal(data.weekEnd, "2026-06-07");
    assert.equal(data.totalOpenRoots, 2);
    assert.equal(data.totalCompletedThisWeek, 2);
    assert.deepEqual(data.kinds.map((kind) => kind.openRoots.map(({ id }) => id)), [
      [1],
      [3],
    ]);
  });

  it("groups logs into configured categories and normalizes missing categories", () => {
    const data = buildDashboardWeekData(
      weekStart,
      [],
      [
        log("a", "2026-06-01", "Outreach"),
        log("b", "2026-06-07", "  "),
        log("c", "2026-06-08", "Outreach"),
        log("d", "2026-05-31", "Build"),
        log("e", "2026-06-03", "Build"),
      ],
      priorities,
    );

    assert.deepEqual(
      data.categories.map(({ category, logEntries }) => [
        category,
        logEntries.map(({ id }) => id),
      ]),
      [
        ["Outreach", ["a"]],
        ["Build", ["e"]],
      ],
    );
  });

  it("returns empty data safely for no tasks, logs, or configured categories", () => {
    const data = buildDashboardWeekData(
      weekStart,
      [],
      [],
      { key: "priorities", slots: [null, null, null, null] },
    );
    assert.equal(data.totalOpenRoots, 0);
    assert.equal(data.totalCompletedThisWeek, 0);
    assert.deepEqual(data.categories, []);
  });
});
