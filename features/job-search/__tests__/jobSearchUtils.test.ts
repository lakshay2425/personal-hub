import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatHandleDisplay,
  getContactDisplayTitle,
  getInteractionUrl,
} from "../lib/productOutreachUtils";
import {
  backfillLeadProfileFields,
  getLeadSocialProfiles,
  getLinkedInProfileUrls,
  getLeadProfileUrl,
  normalizeProfileUrl,
} from "../lib/leadProfileUtils";
import { getTouchpointInlineActions } from "../lib/touchpointInlineActions";
import {
  isTemplatePlaceholder,
  splitBodyWithPlaceholders,
} from "../lib/templatePlaceholders";
import {
  filterTouchpointsByWeek,
  groupLeadsByCompany,
  leadHasAnyTouchpoint,
} from "../lib/leadListUtils";
import {
  DEFAULT_SNOOZE_PRESETS,
  formatSnoozeDate,
  getDefaultSnoozePreset,
  getSnoozeDate,
  isLeadSnoozed,
  normalizeSnoozePresets,
} from "../lib/snoozeUtils";
import { validateJobSearchBackup } from "../repositories/importRepository";
import type {
  Company,
  LeadWithTouchpoints,
  ProductOutreachChannel,
} from "../types";

function lead(
  id: number,
  companyId: number,
  channel: LeadWithTouchpoints["channel"] = "LinkedIn",
  touchpoints: LeadWithTouchpoints["touchpoints"] = [],
): LeadWithTouchpoints {
  return {
    id,
    companyId,
    name: `Lead ${id}`,
    role: "Engineer",
    email: "",
    linkedin: "",
    xProfile: "",
    channel,
    status: "New",
    notes: "",
    isAlumni: false,
    createdAt: new Date(2026, 5, 3).getTime(),
    touchpoints,
  };
}

describe("Job Search profile URL helpers", () => {
  it("normalizes bare profile domains and preserves http(s) URLs", () => {
    assert.equal(normalizeProfileUrl(" linkedin.com/in/a "), "https://linkedin.com/in/a");
    assert.equal(normalizeProfileUrl("http://x.com/a"), "http://x.com/a");
    assert.equal(normalizeProfileUrl(""), "");
  });

  it("uses only the selected social channel and backfills legacy X profiles", () => {
    const linkedInLead = lead(1, 1, "LinkedIn");
    linkedInLead.linkedin = "linkedin.com/in/a";
    assert.equal(getLeadProfileUrl(linkedInLead), "https://linkedin.com/in/a");
    assert.equal(getLeadProfileUrl(lead(2, 1, "Email")), null);

    const xLead = lead(3, 1, "X");
    xLead.linkedin = "x.com/legacy";
    const backfilled = backfillLeadProfileFields(xLead);
    assert.equal(backfilled.xProfile, "x.com/legacy");
    assert.equal(getLeadProfileUrl(backfilled), "https://x.com/legacy");
  });

  it("returns available LinkedIn and X profile URLs regardless of outreach channel", () => {
    const item = lead(1, 1, "Email");
    item.linkedin = "linkedin.com/in/alex";
    item.xProfile = "https://x.com/alex";

    assert.deepEqual(getLeadSocialProfiles(item), {
      linkedin: "https://linkedin.com/in/alex",
      xProfile: "https://x.com/alex",
    });
  });

  it("backfills legacy X profile data and rejects non-social URLs", () => {
    const legacy = lead(1, 1, "X");
    legacy.linkedin = "x.com/alex";
    assert.deepEqual(getLeadSocialProfiles(legacy), {
      linkedin: null,
      xProfile: "https://x.com/alex",
    });

    const invalid = lead(2, 1, "LinkedIn");
    invalid.linkedin = "https://example.com/alex";
    invalid.xProfile = "javascript:alert(1)";
    assert.deepEqual(getLeadSocialProfiles(invalid), {
      linkedin: null,
      xProfile: null,
    });
  });

  it("collects unique LinkedIn URLs and excludes empty or non-LinkedIn values", () => {
    const first = lead(1, 1, "LinkedIn");
    first.linkedin = " linkedin.com/in/alex/ ";
    const duplicate = lead(2, 1, "Email");
    duplicate.linkedin = "https://www.linkedin.com/in/alex/";
    const invalid = lead(3, 1);
    invalid.linkedin = "https://example.com/not-linkedin";

    assert.deepEqual(getLinkedInProfileUrls([
      first,
      duplicate,
      invalid,
      lead(4, 1),
    ]), ["https://linkedin.com/in/alex"]);
  });
});

describe("product outreach formatting", () => {
  const cases: [ProductOutreachChannel, string, string | null][] = [
    ["Instagram", "@@name", "https://instagram.com/name"],
    ["LinkedIn", "linkedin.com/in/name", "https://linkedin.com/in/name"],
    ["X", "@name", "https://x.com/name"],
    ["X", "https://x.com/name", "https://x.com/name"],
    ["Email", "person@example.com", "mailto:person@example.com"],
    ["X", " ", null],
  ];

  for (const [channel, handle, expectedUrl] of cases) {
    it(`builds the correct interaction URL for ${channel} ${handle}`, () => {
      assert.equal(getInteractionUrl(channel, handle), expectedUrl);
    });
  }

  it("formats handles and chooses a fallback display title", () => {
    assert.equal(formatHandleDisplay("Instagram", "@@name"), "@name");
    assert.equal(formatHandleDisplay("X", "name"), "@name");
    assert.equal(formatHandleDisplay("Email", "   "), "—");
    assert.equal(
      getContactDisplayTitle("", [{ channel: "X", handle: "name" }]),
      "@name",
    );
    assert.equal(getContactDisplayTitle("", []), "Untitled contact");
    assert.equal(getContactDisplayTitle(" Custom ", []), "Custom");
  });
});

describe("template placeholder parsing", () => {
  it("splits supported placeholders and retains surrounding text", () => {
    assert.deepEqual(
      splitBodyWithPlaceholders("Hi {{name}} at {{company}}!"),
      ["Hi ", "{{name}}", " at ", "{{company}}", "!"],
    );
  });

  it("recognizes only the supported placeholder tokens", () => {
    assert.equal(isTemplatePlaceholder("{{name}}"), true);
    assert.equal(isTemplatePlaceholder("{{role}}"), true);
    assert.equal(isTemplatePlaceholder("{{unknown}}"), false);
    assert.deepEqual(splitBodyWithPlaceholders("plain text"), ["plain text"]);
  });
});

describe("lead list helpers", () => {
  it("groups leads by company alphabetically and names missing companies safely", () => {
    const leads = [lead(1, 2), lead(2, 1), lead(3, 9)];
    const companies = new Map<number, Company>([
      [1, { id: 1, companyName: "Zeta", sector: "", website: "", notes: "", createdAt: 0, updatedAt: 0 }],
      [2, { id: 2, companyName: "Acme", sector: "", website: "", notes: "", createdAt: 0, updatedAt: 0 }],
    ]);
    assert.deepEqual(
      groupLeadsByCompany(leads, companies).map(({ companyName, leads: group }) => [
        companyName,
        group.map(({ id }) => id),
      ]),
      [["Acme", [1]], ["Unknown", [3]], ["Zeta", [2]]],
    );
  });

  it("reports touchpoint presence and filters by selected week", () => {
    const item = lead(1, 1, "LinkedIn", [
      {
        id: 1,
        leadId: 1,
        channel: "LinkedIn",
        type: "Message",
        status: "Sent",
        responseStatus: "Not responded",
        templateId: null,
        context: "",
        occurredAt: new Date(2026, 5, 3).getTime(),
        createdAt: 1,
      },
      {
        id: 2,
        leadId: 1,
        channel: "LinkedIn",
        type: "Message",
        status: "Sent",
        responseStatus: "Not responded",
        templateId: null,
        context: "",
        occurredAt: new Date(2026, 5, 10).getTime(),
        createdAt: 2,
      },
    ]);
    assert.equal(leadHasAnyTouchpoint(item), true);
    assert.equal(filterTouchpointsByWeek(item.touchpoints, null).length, 2);
    assert.equal(filterTouchpointsByWeek(item.touchpoints, "2026-06-01").length, 1);
    assert.equal(leadHasAnyTouchpoint(lead(2, 1)), false);
  });
});

describe("lead snooze helpers", () => {
  it("treats missing, expired, and today snooze dates as not snoozed", () => {
    assert.equal(isLeadSnoozed({}, "2026-06-10"), false);
    assert.equal(
      isLeadSnoozed({ snoozedUntil: "2026-06-09" }, "2026-06-10"),
      false,
    );
    assert.equal(
      isLeadSnoozed({ snoozedUntil: "2026-06-10" }, "2026-06-10"),
      false,
    );
    assert.equal(
      isLeadSnoozed({ snoozedUntil: "2026-06-11" }, "2026-06-10"),
      true,
    );
    assert.equal(
      isLeadSnoozed({ snoozedUntil: "2026-02-31" }, "2026-06-10"),
      false,
    );
  });

  it("calculates preset dates as local calendar days", () => {
    assert.equal(getSnoozeDate(7, "2026-06-10"), "2026-06-17");
    assert.equal(getSnoozeDate(30, "2026-06-10"), "2026-07-10");
    assert.throws(() => getSnoozeDate(0, "2026-06-10"));
    assert.equal(formatSnoozeDate("2026-06-11"), "11 Jun");
  });

  it("normalizes presets and keeps exactly one usable default", () => {
    assert.deepEqual(normalizeSnoozePresets(null), DEFAULT_SNOOZE_PRESETS);
    assert.deepEqual(
      normalizeSnoozePresets([
        { label: "Later", days: 5, isDefault: false },
        { label: "Soon", days: 2, isDefault: true },
      ]),
      [
        { label: "Later", days: 5, isDefault: false },
        { label: "Soon", days: 2, isDefault: true },
      ],
    );
    assert.deepEqual(
      normalizeSnoozePresets([
        { label: "Later", days: 5, isDefault: false },
        { label: "Soon", days: 2, isDefault: false },
      ]).map(({ isDefault }) => isDefault),
      [true, false],
    );
    assert.equal(
      getDefaultSnoozePreset(normalizeSnoozePresets([])).label,
      "1 week",
    );
  });

  it("accepts older backups without snooze fields", () => {
    const backup = validateJobSearchBackup({
      version: 7,
      companies: [],
      leads: [
        lead(1, 1),
        {
          ...lead(2, 1),
          snoozedUntil: "2026-06-20",
          snoozeReason: "Waiting for role to open",
        },
      ],
      applications: [],
      activityLogs: [],
    });

    assert.equal(backup.leads[0].snoozedUntil, undefined);
    assert.equal(backup.leads[0].snoozeReason, undefined);
    assert.equal(backup.leads[1].snoozedUntil, "2026-06-20");
    assert.equal(backup.leads[1].snoozeReason, "Waiting for role to open");
  });

  it("preserves touchpoint purposes and defaults missing purposes during import", () => {
    const backup = validateJobSearchBackup({
      version: 7,
      companies: [],
      leads: [lead(1, 1)],
      applications: [],
      activityLogs: [],
      leadTouchpoints: [
        {
          leadId: 1,
          channel: "LinkedIn",
          type: "Message Draft",
          purpose: "First follow-up",
          status: "Draft",
          responseStatus: "Not responded",
          templateId: null,
          context: "Hello",
          occurredAt: 1,
          createdAt: 1,
        },
        {
          leadId: 1,
          channel: "Email",
          type: "Message",
          status: "Draft",
          responseStatus: "Not responded",
          templateId: null,
          context: "Hi",
          occurredAt: 2,
          createdAt: 2,
        },
      ],
    });

    assert.equal(backup.leadTouchpoints[0].purpose, "First follow-up");
    assert.equal(backup.leadTouchpoints[1].purpose, "");
  });
});

describe("touchpoint inline actions", () => {
  it("shows accept only for pending LinkedIn connection requests", () => {
    const connectionRequest = {
      id: 1,
      leadId: 1,
      channel: "LinkedIn" as const,
      type: "Connection Request",
      status: "Sent",
      responseStatus: "Not accepted",
      templateId: null,
      context: "",
      occurredAt: Date.now(),
      createdAt: Date.now(),
    };

    assert.deepEqual(getTouchpointInlineActions(connectionRequest), [
      {
        id: "accept",
        label: "Accept",
        update: { responseStatus: "Accepted" },
      },
    ]);
  });

  it("shows Sent for a LinkedIn message draft and changes only its status", () => {
    assert.deepEqual(
      getTouchpointInlineActions({
        id: 1,
        leadId: 1,
        channel: "LinkedIn",
        type: "Message Draft",
        status: "Draft",
        responseStatus: "Not responded",
        templateId: null,
        context: "Hello",
        occurredAt: Date.now(),
        createdAt: Date.now(),
      }),
      [{ id: "sent", label: "Sent", update: { status: "Sent" } }],
    );
  });

  it("shows replied for sent messages and follow-ups that are not yet replied", () => {
    const cases = [
      {
        type: "Message",
        channel: "Email" as const,
      },
      {
        type: "Follow-up",
        channel: "LinkedIn" as const,
      },
      {
        type: "Message Draft",
        channel: "LinkedIn" as const,
      },
      {
        type: "First Follow-up",
        channel: "Email" as const,
      },
      {
        type: "Second Follow-up",
        channel: "Email" as const,
      },
    ];

    for (const item of cases) {
      assert.deepEqual(
        getTouchpointInlineActions({
          id: 1,
          leadId: 1,
          channel: item.channel,
          type: item.type,
          status: "Sent",
          responseStatus: "Not responded",
          templateId: null,
          context: "",
          occurredAt: Date.now(),
          createdAt: Date.now(),
        }),
        [
          {
            id: "replied",
            label: "Replied",
            update: { responseStatus: "Replied" },
          },
        ],
      );
    }
  });

  it("hides inline actions when the touchpoint is already accepted or replied, or is not sent", () => {
    assert.deepEqual(
      getTouchpointInlineActions({
        id: 1,
        leadId: 1,
        channel: "LinkedIn",
        type: "Connection Request",
        status: "Sent",
        responseStatus: "Accepted",
        templateId: null,
        context: "",
        occurredAt: Date.now(),
        createdAt: Date.now(),
      }),
      [],
    );

    assert.deepEqual(
      getTouchpointInlineActions({
        id: 2,
        leadId: 1,
        channel: "Email",
        type: "Message",
        status: "Sent",
        responseStatus: "Replied",
        templateId: null,
        context: "",
        occurredAt: Date.now(),
        createdAt: Date.now(),
      }),
      [],
    );

    assert.deepEqual(
      getTouchpointInlineActions({
        id: 3,
        leadId: 1,
        channel: "LinkedIn",
        type: "Message",
        status: "Draft",
        responseStatus: "Not responded",
        templateId: null,
        context: "",
        occurredAt: Date.now(),
        createdAt: Date.now(),
      }),
      [],
    );
  });
});
