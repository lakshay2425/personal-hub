import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getOutreachQueueGroups } from "../lib/outreachQueue";
import type { Lead } from "../types";

function lead(id: number, nextFollowUpDate: string): Lead {
  return {
    id,
    companyId: 1,
    name: `Lead ${id}`,
    role: "Engineer",
    email: "",
    linkedin: "",
    xProfile: "",
    channel: "LinkedIn",
    status: "New",
    notes: "",
    isAlumni: false,
    nextFollowUpDate,
    createdAt: id,
  };
}

describe("dated outreach queue", () => {
  const now = new Date(2026, 10, 19, 12);

  it("groups overdue, today, and tomorrow separately", () => {
    const groups = getOutreachQueueGroups([
      lead(1, "2026-11-18"),
      lead(2, "2026-11-20"),
      lead(3, "2026-11-19"),
    ], now);

    assert.deepEqual(groups.map((group) => group.title), ["Missed", "Today", "Tomorrow"]);
    assert.deepEqual(groups.map((group) => group.leads.map((item) => item.id)), [[1], [3], [2]]);
  });

  it("keeps later dates in chronological groups and excludes unscheduled leads", () => {
    const groups = getOutreachQueueGroups([
      lead(4, "2026-11-25"),
      lead(5, ""),
      lead(6, "2026-11-21"),
      lead(7, "2026-11-21"),
    ], now);

    assert.equal(groups.length, 2);
    assert.deepEqual(groups[0].leads.map((item) => item.id), [6, 7]);
    assert.deepEqual(groups[1].leads.map((item) => item.id), [4]);
  });

  it("returns no queue sections when no lead has a scheduled date", () => {
    assert.deepEqual(getOutreachQueueGroups([lead(1, "")], now), []);
  });

  it("counts Today and Tomorrow using IST local dates at 1 AM", () => {
    const previousTz = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";
    try {
      const istNow = new Date("2026-11-19T01:00:00+05:30");
      const groups = getOutreachQueueGroups([
        lead(8, "2026-11-19"),
        lead(9, "2026-11-20"),
      ], istNow);

      assert.equal(istNow.getHours(), 1);
      assert.equal(groups.find((group) => group.title === "Today")?.leads.length, 1);
      assert.equal(groups.find((group) => group.title === "Tomorrow")?.leads.length, 1);
    } finally {
      if (previousTz === undefined) delete process.env.TZ;
      else process.env.TZ = previousTz;
    }
  });
});
