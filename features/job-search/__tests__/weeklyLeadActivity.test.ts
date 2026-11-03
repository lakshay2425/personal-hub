import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getWeeklyLeadActivity } from "../lib/weeklyLeadActivity";
import type { LeadWithTouchpoints } from "../types";

function lead(
  id: number,
  createdAt: number,
  touchpoints: LeadWithTouchpoints["touchpoints"] = [],
): LeadWithTouchpoints {
  return {
    id,
    companyId: 1,
    name: `Lead ${id}`,
    role: "",
    email: "",
    linkedin: "",
    xProfile: "",
    channel: "LinkedIn",
    status: "New",
    notes: "",
    isAlumni: false,
    createdAt,
    touchpoints,
  };
}

function timestamp(date: string): number {
  return new Date(`${date}T12:00:00`).getTime();
}

function touchpoint(
  id: number,
  leadId: number,
  date: string,
  status = "Sent",
): LeadWithTouchpoints["touchpoints"][number] {
  return {
    id,
    leadId,
    channel: "LinkedIn",
    type: "Message",
    status,
    responseStatus: "Not responded",
    templateId: null,
    context: "",
    occurredAt: timestamp(date),
    createdAt: timestamp(date),
  };
}

describe("weekly leads activity", () => {
  it("returns exactly Monday through Sunday with zero-count days included", () => {
    const days = getWeeklyLeadActivity([], "2026-06-01", "allLeads");
    assert.deepEqual(
      days.map(({ date, weekday, count }) => [date, weekday, count]),
      [
        ["2026-06-01", "Mon", 0],
        ["2026-06-02", "Tue", 0],
        ["2026-06-03", "Wed", 0],
        ["2026-06-04", "Thu", 0],
        ["2026-06-05", "Fri", 0],
        ["2026-06-06", "Sat", 0],
        ["2026-06-07", "Sun", 0],
      ],
    );
  });

  it("counts lead creation dates per day and excludes leads outside the week", () => {
    const daily = getWeeklyLeadActivity(
      [
        lead(1, timestamp("2026-06-01")),
        lead(2, timestamp("2026-06-01")),
        lead(3, timestamp("2026-06-07")),
        lead(4, timestamp("2026-05-31")),
        lead(5, timestamp("2026-06-08")),
      ],
      "2026-06-01",
      "allLeads",
    );

    assert.deepEqual(
      daily.map(({ count }) => count),
      [2, 0, 0, 0, 0, 0, 1],
    );
  });

  it("counts only Sent touchpoints by occurredAt date", () => {
    const daily = getWeeklyLeadActivity(
      [
        lead(1, timestamp("2026-05-30"), [
          touchpoint(1, 1, "2026-06-01"),
          touchpoint(2, 1, "2026-06-01"),
          touchpoint(3, 1, "2026-06-02", "Draft"),
          touchpoint(4, 1, "2026-06-08"),
        ]),
      ],
      "2026-06-01",
      "byTouchpoint",
    );

    assert.deepEqual(
      daily.map(({ count }) => count),
      [2, 0, 0, 0, 0, 0, 0],
    );
  });

  it("uses the selected view to switch between leads and sent touchpoints", () => {
    const leads = [
      lead(1, timestamp("2026-06-03"), [
        touchpoint(1, 1, "2026-06-03"),
        touchpoint(2, 1, "2026-06-03", "Draft"),
      ]),
      lead(2, timestamp("2026-06-03")),
    ];

    assert.equal(
      getWeeklyLeadActivity(leads, "2026-06-01", "allLeads")[2].count,
      2,
    );
    assert.equal(
      getWeeklyLeadActivity(leads, "2026-06-01", "byTouchpoint")[2].count,
      1,
    );
  });
});
