import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_FOLLOW_UP_DELAY_DAYS } from "../constants";
import { getScheduledFollowUps, validateFollowUpDelayDays, validateOutreachDate } from "../lib/followUpScheduling";
import type { Lead, LeadTouchpoint } from "../types";

const lead = (id: number, followUpDelayDays?: number): Lead => ({
  id, companyId: 1, name: `Lead ${id}`, role: "Engineer", email: "", linkedin: "", xProfile: "",
  channel: "LinkedIn", status: "Contacted", notes: "", isAlumni: false, followUpDelayDays, createdAt: 1,
});

const touchpoint = (overrides: Partial<LeadTouchpoint> = {}): LeadTouchpoint => ({
  id: 10, leadId: 1, channel: "LinkedIn", type: "Message", status: "Sent",
  responseStatus: "Not responded", templateId: null, context: "", occurredAt: new Date(2026, 10, 19, 10).getTime(), createdAt: 1,
  ...overrides,
});

describe("follow-up scheduling", () => {
  it("defaults the global first follow-up delay to three days", () => {
    assert.equal(DEFAULT_FOLLOW_UP_DELAY_DAYS, 3);
  });

  it("uses the global default delay after a sent initial message", () => {
    assert.deepEqual(getScheduledFollowUps([lead(1)], [touchpoint()], 3), [
      { leadId: 1, date: "2026-11-22", channel: "LinkedIn", touchpointId: 10 },
    ]);
  });

  it("uses a valid lead override without changing other leads", () => {
    const schedules = getScheduledFollowUps([lead(1, 5), lead(2)], [touchpoint({ id: 10, leadId: 1 }), touchpoint({ id: 11, leadId: 2 })], 3);
    assert.deepEqual(schedules.map((item) => item.date), ["2026-11-24", "2026-11-22"]);
  });

  it("does not schedule drafts, connection requests, replied messages, or leads with a sent follow-up", () => {
    const initial = touchpoint();
    const cases: Array<[Lead[], LeadTouchpoint[]]> = [
      [[lead(1)], [{ ...initial, status: "Draft" }]],
      [[lead(1)], [{ ...initial, type: "Connection Request" }]],
      [[lead(1)], [{ ...initial, responseStatus: "Replied" }]],
      [[lead(1)], [initial, touchpoint({ id: 11, type: "Follow-up", occurredAt: initial.occurredAt + 1 })]],
    ];
    for (const [leads, touchpoints] of cases) assert.deepEqual(getScheduledFollowUps(leads, touchpoints, 3), []);
  });

  it("rejects invalid and past new-conversation dates but accepts today and future dates", () => {
    const today = new Date(2026, 10, 19, 12);
    assert.equal(validateOutreachDate("2026-11-18", today), "Outreach cannot be scheduled for a past date.");
    assert.equal(validateOutreachDate("not-a-date", today), "Choose a valid outreach date.");
    assert.equal(validateOutreachDate("2026-11-19", today), null);
    assert.equal(validateOutreachDate("2026-11-20", today), null);
  });

  it("validates lead-specific delay overrides as whole days from 1 to 365", () => {
    assert.equal(validateFollowUpDelayDays(undefined), null);
    assert.equal(validateFollowUpDelayDays(5), null);
    assert.notEqual(validateFollowUpDelayDays(0), null);
    assert.notEqual(validateFollowUpDelayDays(1.5), null);
    assert.notEqual(validateFollowUpDelayDays(366), null);
  });
});
