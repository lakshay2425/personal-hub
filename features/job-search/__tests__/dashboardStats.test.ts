import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  countMatchingLeadsBySnoozeStatus,
  getApplicationDashboardMetrics,
  getTouchpointDashboardMetrics,
} from "../repositories/dashboardRepository";
import type { Lead, LeadTouchpoint } from "../types";

function lead(id: number, snoozedUntil?: string): Lead {
  return {
    id,
    companyId: 1,
    name: `Lead ${id}`,
    role: "",
    email: "",
    linkedin: "",
    xProfile: "",
    channel: "LinkedIn",
    status: "Contacted",
    notes: "",
    isAlumni: false,
    snoozedUntil,
    createdAt: 0,
  };
}

function touchpoint(
  leadId: number,
  responseStatus: string,
  status = "Sent",
): LeadTouchpoint {
  return {
    leadId,
    channel: "LinkedIn",
    type: "Connection Request",
    status,
    responseStatus,
    templateId: null,
    context: "",
    occurredAt: 1,
    createdAt: 1,
  };
}

describe("dashboard connection-request snooze counts", () => {
  it("counts unique matching leads as active or snoozed at read time", () => {
    const leads = [
      lead(1),
      lead(2, "2026-06-11"),
      lead(3, "2026-06-09"),
      lead(4, "2026-06-10"),
    ];
    const touchpoints = [
      touchpoint(1, "Not accepted"),
      touchpoint(1, "Not accepted"),
      touchpoint(2, "Not accepted"),
      touchpoint(3, "Not accepted"),
      touchpoint(4, "Not accepted"),
      touchpoint(2, "Accepted"),
      touchpoint(5, "Not accepted", "Draft"),
    ];

    const counts = countMatchingLeadsBySnoozeStatus(
      leads,
      touchpoints,
      (item) =>
        item.channel === "LinkedIn" &&
        item.type === "Connection Request" &&
        item.status === "Sent" &&
        item.responseStatus === "Not accepted",
      "2026-06-10",
    );

    assert.deepEqual(counts, { notSnoozed: 3, snoozed: 1 });
  });
});

describe("dashboard application metrics", () => {
  it("counts each application status in range and excludes older records", () => {
    const applications = [
      { status: "Applied", createdAt: 100 },
      { status: "Interview", createdAt: 200 },
      { status: "Rejected", createdAt: 300 },
      { status: "Offer", createdAt: 400 },
      { status: "Rejected", createdAt: 50 },
    ];

    assert.deepEqual(getApplicationDashboardMetrics(applications, 100), {
      applicationsApplied: 1,
      interviews: 1,
      applicationsRejected: 1,
      offers: 1,
    });
  });
});

describe("dashboard touchpoint metrics", () => {
  it("counts records by channel and only counts in-range drafts", () => {
    const touchpoints = [
      { ...touchpoint(1, "Not responded"), occurredAt: 100 },
      {
        ...touchpoint(2, "Not responded", "Draft"),
        type: "Message Draft",
        occurredAt: 200,
      },
      {
        ...touchpoint(3, "Not responded", "Draft"),
        channel: "Email" as const,
        type: "First Follow-up",
        occurredAt: 300,
      },
      {
        ...touchpoint(4, "Not responded"),
        channel: "X" as const,
        occurredAt: 400,
      },
      {
        ...touchpoint(5, "Not responded", "Draft"),
        type: "Message Draft",
        occurredAt: 50,
      },
    ];

    assert.deepEqual(getTouchpointDashboardMetrics(touchpoints, 100), {
      totalTouchpoints: 4,
      linkedinTouchpoints: 2,
      xTouchpoints: 1,
      emailTouchpoints: 1,
      linkedinMessageDrafts: 1,
      emailDrafts: 1,
    });
  });
});
