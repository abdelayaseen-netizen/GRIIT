import { describe, it, expect } from "vitest";
import { journalDraftDateKey, journalDraftStorageKey } from "./journal-draft";

describe("journalDraftStorageKey", () => {
  it("scopes by challenge, task, and date", () => {
    expect(
      journalDraftStorageKey({
        activeChallengeId: "ac-1",
        taskId: "t-1",
        dateKey: "2026-07-28",
      })
    ).toBe("griit_journal_draft:ac-1:t-1:2026-07-28");
  });
});

describe("journalDraftDateKey", () => {
  it("formats local YYYY-MM-DD", () => {
    expect(journalDraftDateKey(new Date(2026, 6, 28, 21, 0, 0))).toBe(
      "2026-07-28"
    );
  });
});
