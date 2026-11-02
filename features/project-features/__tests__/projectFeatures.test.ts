import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createProjectFeatureRecord,
  didProjectFeatureStatusChange,
  updateProjectFeatureRecord,
} from "../lib/featureUtils";
import type { ProjectFeature } from "../types";

const existing: ProjectFeature = {
  id: 8,
  projectId: "project-a",
  versionId: 2,
  title: "Existing feature",
  status: "Planned",
  notes: "Existing notes",
  createdAt: 10,
};

describe("project feature record creation", () => {
  it("trims text, applies defaults, and preserves explicit version IDs", () => {
    assert.deepEqual(
      createProjectFeatureRecord(
        {
          projectId: "project-a",
          title: "  Add search ",
          notes: " notes ",
          versionId: 3,
        },
        123,
      ),
      {
        projectId: "project-a",
        versionId: 3,
        title: "Add search",
        status: "Idea",
        notes: "notes",
        createdAt: 123,
      },
    );
  });

  it("keeps a null version and empty notes when optional values are absent", () => {
    const result = createProjectFeatureRecord(
      { projectId: "p", title: "Feature" },
      1,
    );
    assert.equal(result.versionId, null);
    assert.equal(result.notes, "");
    assert.equal(result.status, "Idea");
  });
});

describe("project feature updates", () => {
  it("trims only provided text fields and preserves omitted fields", () => {
    assert.deepEqual(
      updateProjectFeatureRecord(existing, { title: " Updated ", notes: " " }),
      { ...existing, title: "Updated", notes: "" },
    );
  });

  it("distinguishes explicit null version updates from omitted version", () => {
    assert.equal(updateProjectFeatureRecord(existing, {}).versionId, 2);
    assert.equal(
      updateProjectFeatureRecord(existing, { versionId: null }).versionId,
      null,
    );
  });

  it("logs status changes only when both statuses exist and differ", () => {
    assert.equal(didProjectFeatureStatusChange({ status: "Done" }, "Planned"), true);
    assert.equal(didProjectFeatureStatusChange({ status: "Planned" }, "Planned"), false);
    assert.equal(didProjectFeatureStatusChange({ status: "Done" }), false);
    assert.equal(didProjectFeatureStatusChange({}, "Planned"), false);
  });
});
