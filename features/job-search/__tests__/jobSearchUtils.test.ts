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
      { id: "accept", label: "Accept", responseStatus: "Accepted" },
    ]);
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
          { id: "replied", label: "Replied", responseStatus: "Replied" },
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
