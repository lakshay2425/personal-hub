import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildQuestionTree,
  canMoveToRoot,
  collectDescendantIds,
  countAllDescendants,
  getValidParentTargets,
  isDescendantOf,
  truncateQuestionText,
} from "../lib/questionTree";
import type { Question } from "../types";

function question(
  id: string,
  parentId: string | null,
  depth: 0 | 1 | 2,
  sortOrder = 0,
): Question {
  return {
    id,
    projectId: null,
    parentId,
    depth,
    sortOrder,
    questionText: `Question ${id}`,
    status: "unanswered",
    createdAt: Number(id.replace(/\D/g, "")) || 1,
    updatedAt: 1,
    answeredAt: null,
  };
}

describe("question hierarchy", () => {
  it("builds a sorted nested tree and counts descendants", () => {
    const records = [
      question("child", "root", 1, 0),
      question("root", null, 0, 0),
      question("other", null, 0, 1),
      question("grandchild", "child", 2),
    ];
    const original = [...records];
    const tree = buildQuestionTree(records);

    assert.deepEqual(tree.map(({ id }) => id), ["root", "other"]);
    assert.equal(tree[0].children[0].children[0].id, "grandchild");
    assert.equal(countAllDescendants(tree[0]), 2);
    assert.deepEqual(records, original);
  });

  it("collects recursive descendants and checks ancestry", () => {
    const records = [
      question("r", null, 0),
      question("c", "r", 1),
      question("g", "c", 2),
    ];
    assert.deepEqual(collectDescendantIds("r", records), ["c", "g"]);
    assert.equal(isDescendantOf("r", "g", records), true);
    assert.equal(isDescendantOf("g", "r", records), false);
  });

  it("prevents self-parenting, descendant cycles, and depth overflow", () => {
    const records = [
      question("root", null, 0),
      question("child", "root", 1),
      question("grandchild", "child", 2),
      question("other", null, 0),
      question("deep", null, 2),
    ];
    assert.deepEqual(
      getValidParentTargets("child", records).map(({ id }) => id),
      ["root", "other"],
    );
    assert.equal(canMoveToRoot("child", records), true);
    assert.equal(canMoveToRoot("root", records), false);
    assert.deepEqual(getValidParentTargets("missing", records), []);
  });

  it("truncates long text but preserves text at or under the limit", () => {
    assert.equal(truncateQuestionText("hello", 5), "hello");
    assert.equal(truncateQuestionText("hello!", 5), "hello…");
    assert.equal(truncateQuestionText("hello", 0), "…");
  });
});
