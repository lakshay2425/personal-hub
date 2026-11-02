import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateLoggerBackup } from "../lib/importRepository";
import { formatLogDate } from "../lib/dateUtils";
import type { LogEntry } from "../types";

const entry: LogEntry = {
  id: "entry-1",
  date: "2026-01-02",
  text: "Completed task",
  createdAt: 1,
  updatedAt: 2,
};

describe("logger backup validation", () => {
  it("accepts a version 1 backup with log entries", () => {
    assert.deepEqual(validateLoggerBackup({ version: 1, logEntries: [entry] }), {
      version: 1,
      logEntries: [entry],
    });
  });

  it("accepts an empty log-entry list", () => {
    assert.deepEqual(
      validateLoggerBackup({ version: 1, logEntries: [] }).logEntries,
      [],
    );
  });

  it("rejects null, arrays, wrong versions, and missing or non-array entries", () => {
    for (const invalid of [
      null,
      [],
      { version: 2, logEntries: [] },
      { version: 1 },
      { version: 1, logEntries: {} },
    ]) {
      assert.throws(() => validateLoggerBackup(invalid));
    }
  });

  it("formats a local calendar date with weekday, month, and year", () => {
    const formatted = formatLogDate("2026-01-02");
    assert.match(formatted, /2026/);
    assert.match(formatted, /January/);
    assert.match(formatted, /Friday/);
  });
});
