import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { replaceSelection, toggleSelection } from "../lib/selectionUtils";

describe("shared bulk selection", () => {
  it("adds and removes a selected ID without mutating the input Set", () => {
    const initial = new Set([1]);
    const added = toggleSelection(initial, 2);
    const removed = toggleSelection(added, 1);

    assert.deepEqual([...initial], [1]);
    assert.deepEqual([...added], [1, 2]);
    assert.deepEqual([...removed], [2]);
  });

  it("supports string IDs and preserves insertion order", () => {
    assert.deepEqual(
      [...toggleSelection(new Set(["lead-a"]), "lead-b")],
      ["lead-a", "lead-b"],
    );
  });

  it("replaces selection, removes duplicates, and does not retain prior IDs", () => {
    const selected = replaceSelection([1, 1, 2]);
    assert.deepEqual([...selected], [1, 2]);
    assert.deepEqual([...replaceSelection([])], []);
  });
});
