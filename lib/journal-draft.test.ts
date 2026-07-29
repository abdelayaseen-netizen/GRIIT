import { describe, it, expect, vi, afterEach } from "vitest";
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
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses task timezone, not device-local calendar day", () => {
    // 2026-07-29 03:30 UTC = still 2026-07-28 in America/Los_Angeles
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T03:30:00.000Z"));
    expect(journalDraftDateKey("America/Los_Angeles")).toBe("2026-07-28");
    expect(journalDraftDateKey("UTC")).toBe("2026-07-29");
  });

  it("falls back to UTC when timezone omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T22:00:00.000Z"));
    expect(journalDraftDateKey(null)).toBe("2026-07-28");
    expect(journalDraftDateKey(undefined)).toBe("2026-07-28");
  });
});
