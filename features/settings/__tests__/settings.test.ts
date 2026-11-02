import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validatePrioritySlots,
  getActivePriorities,
  getPriorityColor,
} from "../lib/priorityUtils";
import {
  DEFAULT_PRIORITY_SLOTS,
  PRIORITY_SLOT_COUNT,
  UNASSIGNED,
  type PrioritiesSettings,
} from "../types";

describe("priority settings validation", () => {
  it("accepts exactly the configured number of slots and allows empty slots", () => {
    assert.doesNotThrow(() => validatePrioritySlots([...DEFAULT_PRIORITY_SLOTS]));
    assert.equal(DEFAULT_PRIORITY_SLOTS.length, PRIORITY_SLOT_COUNT);
  });

  it("rejects a slot count mismatch", () => {
    assert.throws(
      () => validatePrioritySlots([null]),
      new RegExp(`Expected ${PRIORITY_SLOT_COUNT} priority slots`),
    );
  });

  it("rejects duplicate names regardless of case and surrounding whitespace", () => {
    assert.throws(
      () =>
        validatePrioritySlots([
          { name: " Outreach ", color: "#000000" },
          { name: "outreach", color: "#ffffff" },
          null,
          null,
        ]),
      /unique/,
    );
  });

  it("ignores null and blank names when checking uniqueness", () => {
    assert.doesNotThrow(() =>
      validatePrioritySlots([
        { name: " ", color: "#000000" },
        null,
        { name: "Work", color: "#ffffff" },
        null,
      ]),
    );
  });
});

describe("priority display helpers", () => {
  const settings: PrioritiesSettings = {
    key: "priorities",
    slots: [
      { name: "Outreach", color: "#123456" },
      null,
      { name: "Build", color: "#abcdef" },
      { name: " ", color: "#ffffff" },
    ],
  };

  it("returns active named slots and omits blanks and nulls", () => {
    assert.deepEqual(
      getActivePriorities(settings.slots).map(({ name }) => name),
      ["Outreach", "Build"],
    );
  });

  it("returns configured colors and no color for missing or unassigned categories", () => {
    assert.equal(getPriorityColor(settings.slots, "Outreach", UNASSIGNED), "#123456");
    assert.equal(getPriorityColor(settings.slots, "Unknown", UNASSIGNED), null);
    assert.equal(getPriorityColor(settings.slots, UNASSIGNED, UNASSIGNED), null);
  });
});
