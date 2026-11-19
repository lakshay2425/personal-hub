import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_FOLLOW_UP_DELAY_DAYS } from "../constants";
import {
  getFirstFollowUpDate,
  getScheduledFollowUps,
  resolveFollowUpDelayDays,
  validateFollowUpDelayDays,
  validateOutreachDate,
} from "../lib/followUpScheduling";
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
    const initial = touchpoint();
    const scheduledLead = {
      ...lead(1),
      scheduledFirstFollowUpDate: getFirstFollowUpDate(initial.occurredAt, DEFAULT_FOLLOW_UP_DELAY_DAYS),
      scheduledFirstFollowUpTouchpointId: initial.id,
    };
    assert.deepEqual(getScheduledFollowUps([scheduledLead], [initial]), [
      { leadId: 1, date: "2026-11-22", channel: "LinkedIn", touchpointId: 10 },
    ]);
  });

  it("gives the lead override precedence over the global delay", () => {
    assert.equal(resolveFollowUpDelayDays(lead(1, 5), 3), 5);
    assert.equal(resolveFollowUpDelayDays(lead(2), 3), 3);
  });

  it("does not schedule drafts, connection requests, replied messages, or leads with a sent follow-up", () => {
    const initial = touchpoint();
    const cases: LeadTouchpoint[][] = [
      [{ ...initial, status: "Draft" }],
      [{ ...initial, type: "Connection Request" }],
      [{ ...initial, responseStatus: "Replied" }],
      [initial, touchpoint({ id: 11, type: "Follow-up", occurredAt: initial.occurredAt + 1 })],
    ];
    for (const touchpoints of cases) {
      const scheduledLead = {
        ...lead(1),
        scheduledFirstFollowUpDate: "2026-11-22",
        scheduledFirstFollowUpTouchpointId: initial.id,
      };
      assert.deepEqual(getScheduledFollowUps([scheduledLead], touchpoints), []);
    }
  });

  it("does not show historical sent messages that have no saved follow-up date", () => {
    assert.deepEqual(getScheduledFollowUps([lead(1)], [touchpoint()]), []);
  });

  it("keeps an already-scheduled date unchanged if the global default later changes", () => {
    const initial = touchpoint();
    const scheduledLead = {
      ...lead(1),
      scheduledFirstFollowUpDate: "2026-11-22",
      scheduledFirstFollowUpTouchpointId: initial.id,
    };
    assert.equal(getScheduledFollowUps([scheduledLead], [initial])[0]?.date, "2026-11-22");
  });

  it("uses local calendar dates at 1 AM IST rather than the previous UTC date", () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";
    try {
      const sentAt = new Date("2026-11-19T01:00:00+05:30");
      assert.equal(sentAt.getHours(), 1);
      assert.equal(getFirstFollowUpDate(sentAt.getTime(), 3), "2026-11-22");
      assert.equal(validateOutreachDate("2026-11-19", sentAt), null);
    } finally {
      if (previousTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = previousTimezone;
    }
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
