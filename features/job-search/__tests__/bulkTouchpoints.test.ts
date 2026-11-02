import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { QUICK_TOUCHPOINT_ACTIONS } from "../constants";
import {
  applyBulkTouchpointAction,
  canSelectLeadForBulkTouchpoint,
  getBulkTouchpointEligibility,
  getCommonLeadChannel,
  runBulkTouchpointWrites,
  type BulkTouchpointWriters,
} from "../lib/bulkTouchpoints";
import type {
  LeadChannel,
  LeadTouchpoint,
  LeadWithTouchpoints,
} from "../types";

function makeLead(
  id: number,
  channel: LeadChannel = "LinkedIn",
  touchpoints: LeadTouchpoint[] = [],
): LeadWithTouchpoints {
  return {
    id,
    companyId: 1,
    name: `Lead ${id}`,
    role: "Engineer",
    email: `lead${id}@example.com`,
    linkedin: "",
    xProfile: "",
    channel,
    status: "New",
    notes: "",
    isAlumni: false,
    createdAt: 1,
    touchpoints,
  };
}

function makeTouchpoint(
  id: number,
  leadId: number,
  overrides: Partial<LeadTouchpoint> = {},
): LeadTouchpoint {
  return {
    id,
    leadId,
    channel: "LinkedIn",
    type: "Message",
    status: "Sent",
    responseStatus: "Not responded",
    templateId: null,
    context: "",
    occurredAt: id * 100,
    createdAt: id * 100,
    ...overrides,
  };
}

function action(id: string) {
  const found = Object.values(QUICK_TOUCHPOINT_ACTIONS)
    .flat()
    .find((candidate) => candidate.id === id);
  assert.ok(found, `Expected quick action '${id}' to exist`);
  return found;
}

function makeWriters(
  overrides: Partial<BulkTouchpointWriters> = {},
): BulkTouchpointWriters & {
  appendCalls: Parameters<BulkTouchpointWriters["appendTouchpoints"]>[];
  editCalls: Parameters<BulkTouchpointWriters["editTouchpoints"]>[];
} {
  const appendCalls: Parameters<BulkTouchpointWriters["appendTouchpoints"]>[] =
    [];
  const editCalls: Parameters<BulkTouchpointWriters["editTouchpoints"]>[] = [];
  return {
    appendCalls,
    editCalls,
    appendTouchpoints: async (...args) => {
      appendCalls.push(args);
      await overrides.appendTouchpoints?.(...args);
    },
    editTouchpoints: async (...args) => {
      editCalls.push(args);
      await overrides.editTouchpoints?.(...args);
    },
  };
}

describe("bulk touchpoint lead selection", () => {
  it("has no common channel when no leads are selected", () => {
    assert.equal(getCommonLeadChannel([]), null);
  });

  it("returns the channel when selected leads all use the same channel", () => {
    assert.equal(
      getCommonLeadChannel([makeLead(1), makeLead(2)]),
      "LinkedIn",
    );
    assert.equal(
      getCommonLeadChannel([makeLead(3, "Email"), makeLead(4, "Email")]),
      "Email",
    );
  });

  it("does not allow selecting a lead from another channel", () => {
    assert.equal(
      canSelectLeadForBulkTouchpoint([makeLead(1)], makeLead(2, "X")),
      false,
    );
    assert.equal(
      canSelectLeadForBulkTouchpoint([makeLead(1)], makeLead(2, "LinkedIn")),
      true,
    );
  });

  it("rejects applying an action to an empty or mixed-channel selection", async () => {
    const writers = makeWriters();
    const connectionSent = action("connection-request-sent");

    await assert.rejects(
      applyBulkTouchpointAction(connectionSent, [], writers),
      /Select at least one lead/,
    );
    await assert.rejects(
      applyBulkTouchpointAction(
        connectionSent,
        [makeLead(1), makeLead(2, "Email")],
        writers,
      ),
      /same channel/,
    );
    assert.equal(writers.appendCalls.length, 0);
    assert.equal(writers.editCalls.length, 0);
  });
});

describe("bulk touchpoint action eligibility", () => {
  it("allows create actions without prior touchpoints", () => {
    assert.deepEqual(
      getBulkTouchpointEligibility(action("connection-request-sent"), [
        makeLead(1),
      ]),
      { touchpointIds: [] },
    );
  });

  it("requires a selection and common channel for update actions", () => {
    const reply = action("linkedin-reply-received");
    assert.match(getBulkTouchpointEligibility(reply, []).error ?? "", /at least one/);
    assert.match(
      getBulkTouchpointEligibility(reply, [
        makeLead(1),
        makeLead(2, "Email"),
      ]).error ?? "",
      /same channel/,
    );
  });

  it("only updates the latest eligible LinkedIn message for each lead", () => {
    const reply = action("linkedin-reply-received");
    const leads = [
      makeLead(1, "LinkedIn", [
        makeTouchpoint(10, 1, { occurredAt: 100 }),
        makeTouchpoint(11, 1, {
          type: "Connection Request",
          occurredAt: 150,
        }),
        makeTouchpoint(12, 1, { occurredAt: 200 }),
      ]),
      makeLead(2, "LinkedIn", [makeTouchpoint(20, 2)]),
    ];

    assert.deepEqual(getBulkTouchpointEligibility(reply, leads), {
      touchpointIds: [12, 20],
    });
  });

  it("accepts only sent, unanswered connection requests for acceptance", () => {
    const acceptance = action("connection-accepted");
    const lead = makeLead(1, "LinkedIn", [
      makeTouchpoint(1, 1, {
        type: "Connection Request",
        responseStatus: "Accepted",
        occurredAt: 500,
      }),
      makeTouchpoint(2, 1, {
        type: "Connection Request",
        responseStatus: "Not accepted",
        occurredAt: 300,
      }),
      makeTouchpoint(3, 1, {
        type: "Connection Request",
        status: "Draft",
        occurredAt: 400,
      }),
      makeTouchpoint(4, 1, {
        type: "Message",
        occurredAt: 450,
      }),
    ]);

    assert.deepEqual(getBulkTouchpointEligibility(acceptance, [lead]), {
      touchpointIds: [2],
    });
  });

  it("supports replying to Email follow-up touchpoints", () => {
    const reply = action("email-reply-received");
    const lead = makeLead(1, "Email", [
      makeTouchpoint(7, 1, {
        channel: "Email",
        type: "First Follow-up",
      }),
    ]);

    assert.deepEqual(getBulkTouchpointEligibility(reply, [lead]), {
      touchpointIds: [7],
    });
  });

  it("supports replying to X follow-up touchpoints", () => {
    const reply = action("x-reply-received");
    const lead = makeLead(1, "X", [
      makeTouchpoint(8, 1, {
        channel: "X",
        type: "Follow-up",
      }),
    ]);

    assert.deepEqual(getBulkTouchpointEligibility(reply, [lead]), {
      touchpointIds: [8],
    });
  });

  it("blocks an update if any selected lead has no eligible touchpoint", () => {
    const eligibility = getBulkTouchpointEligibility(
      action("linkedin-reply-received"),
      [
        makeLead(1, "LinkedIn", [makeTouchpoint(1, 1)]),
        makeLead(2),
      ],
    );

    assert.deepEqual(eligibility.touchpointIds, []);
    assert.match(eligibility.error ?? "", /Every selected lead/);
  });

  it("blocks tied latest eligible touchpoints rather than choosing arbitrarily", () => {
    const eligibility = getBulkTouchpointEligibility(
      action("linkedin-reply-received"),
      [
        makeLead(1, "LinkedIn", [
          makeTouchpoint(1, 1, { occurredAt: 100 }),
          makeTouchpoint(2, 1, { occurredAt: 100 }),
        ]),
      ],
    );

    assert.deepEqual(eligibility.touchpointIds, []);
    assert.match(eligibility.error ?? "", /one clear latest/);
  });

  it("blocks updates if the selected touchpoint has no persisted ID", () => {
    const eligibility = getBulkTouchpointEligibility(
      action("linkedin-reply-received"),
      [
        makeLead(1, "LinkedIn", [
          makeTouchpoint(1, 1, { id: undefined }),
        ]),
      ],
    );

    assert.deepEqual(eligibility.touchpointIds, []);
    assert.match(eligibility.error ?? "", /one clear latest/);
  });
});

describe("bulk touchpoint action execution", () => {
  it("creates the same LinkedIn connection-request touchpoint for every selected lead", async () => {
    const writers = makeWriters();
    await applyBulkTouchpointAction(
      action("connection-request-sent"),
      [makeLead(1), makeLead(2)],
      writers,
      () => 123456,
    );

    assert.deepEqual(writers.appendCalls, [
      [
        [1, 2],
        {
          channel: "LinkedIn",
          type: "Connection Request",
          status: "Sent",
          responseStatus: "Not accepted",
          templateId: null,
          context: "",
          occurredAt: 123456,
        },
        { updateLeadStatus: false },
      ],
    ]);
    assert.equal(writers.editCalls.length, 0);
  });

  it("creates an Email or X message with the channel-specific mapping", async () => {
    const emailWriters = makeWriters();
    await applyBulkTouchpointAction(
      action("email-sent"),
      [makeLead(1, "Email")],
      emailWriters,
      () => 100,
    );
    assert.equal(emailWriters.appendCalls[0][1].channel, "Email");
    assert.equal(emailWriters.appendCalls[0][1].type, "Message");

    const xWriters = makeWriters();
    await applyBulkTouchpointAction(
      action("x-message-sent"),
      [makeLead(2, "X")],
      xWriters,
      () => 200,
    );
    assert.equal(xWriters.appendCalls[0][1].channel, "X");
    assert.equal(xWriters.appendCalls[0][1].responseStatus, "Not responded");
  });

  it("updates every selected reply touchpoint without creating new touchpoints", async () => {
    const writers = makeWriters();
    await applyBulkTouchpointAction(
      action("linkedin-reply-received"),
      [
        makeLead(1, "LinkedIn", [makeTouchpoint(11, 1)]),
        makeLead(2, "LinkedIn", [makeTouchpoint(22, 2)]),
      ],
      writers,
    );

    assert.deepEqual(writers.editCalls, [
      [
        [11, 22],
        { responseStatus: "Replied" },
        { updateLeadStatus: false },
      ],
    ]);
    assert.equal(writers.appendCalls.length, 0);
  });

  it("updates connection acceptance status instead of adding a touchpoint", async () => {
    const writers = makeWriters();
    await applyBulkTouchpointAction(
      action("connection-accepted"),
      [
        makeLead(1, "LinkedIn", [
          makeTouchpoint(5, 1, {
            type: "Connection Request",
            responseStatus: "Not accepted",
          }),
        ]),
      ],
      writers,
    );

    assert.deepEqual(writers.editCalls[0], [
      [5],
      { responseStatus: "Accepted" },
      { updateLeadStatus: false },
    ]);
    assert.equal(writers.appendCalls.length, 0);
  });

  it("does not call writers when an update action is ineligible", async () => {
    const writers = makeWriters();
    await assert.rejects(
      applyBulkTouchpointAction(
        action("linkedin-reply-received"),
        [makeLead(1)],
        writers,
      ),
      /Every selected lead/,
    );
    assert.equal(writers.appendCalls.length, 0);
    assert.equal(writers.editCalls.length, 0);
  });

  it("propagates create failures so the caller can show an error", async () => {
    const writers = makeWriters({
      appendTouchpoints: async () => {
        throw new Error("storage unavailable");
      },
    });

    await assert.rejects(
      applyBulkTouchpointAction(
        action("connection-request-sent"),
        [makeLead(1)],
        writers,
      ),
      /storage unavailable/,
    );
  });

  it("propagates update failures so the caller can show an error", async () => {
    const writers = makeWriters({
      editTouchpoints: async () => {
        throw new Error("touchpoint missing");
      },
    });

    await assert.rejects(
      applyBulkTouchpointAction(
        action("linkedin-reply-received"),
        [makeLead(1, "LinkedIn", [makeTouchpoint(1, 1)])],
        writers,
      ),
      /touchpoint missing/,
    );
  });
});

describe("bulk touchpoint persistence", () => {
  it("writes each lead in order and refreshes once after success", async () => {
    const calls: number[] = [];
    let refreshCount = 0;
    await runBulkTouchpointWrites(
      [1, 2, 3],
      async (id) => {
        calls.push(id);
      },
      async () => {
        refreshCount += 1;
      },
    );

    assert.deepEqual(calls, [1, 2, 3]);
    assert.equal(refreshCount, 1);
  });

  it("refreshes and propagates the error if a write fails partway through", async () => {
    const calls: number[] = [];
    let refreshCount = 0;

    await assert.rejects(
      runBulkTouchpointWrites(
        [1, 2, 3],
        async (id) => {
          calls.push(id);
          if (id === 2) throw new Error("database write failed");
        },
        async () => {
          refreshCount += 1;
        },
      ),
      /database write failed/,
    );

    assert.deepEqual(calls, [1, 2]);
    assert.equal(refreshCount, 1);
  });

  it("refreshes after an empty batch without attempting a write", async () => {
    let writeCount = 0;
    let refreshCount = 0;
    await runBulkTouchpointWrites(
      [],
      async () => {
        writeCount += 1;
      },
      async () => {
        refreshCount += 1;
      },
    );

    assert.equal(writeCount, 0);
    assert.equal(refreshCount, 1);
  });

  it("propagates refresh failures", async () => {
    await assert.rejects(
      runBulkTouchpointWrites(
        [1],
        async () => {},
        async () => {
          throw new Error("refresh failed");
        },
      ),
      /refresh failed/,
    );
  });
});
