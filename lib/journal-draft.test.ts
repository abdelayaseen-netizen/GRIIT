import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodayDateKey, resolveCheckInTimeZone } from "./date-utils";
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

  it("uses shared resolveCheckInTimeZone (schedule wins)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T03:30:00.000Z"));
    expect(journalDraftDateKey("America/Los_Angeles", "America/New_York")).toBe(
      "2026-07-28"
    );
    expect(journalDraftDateKey("UTC", "America/Los_Angeles")).toBe(
      "2026-07-29"
    );
  });

  it("matches complete date_key when schedule unset (profile fallback)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T03:30:00.000Z"));
    const profile = "America/New_York";
    expect(journalDraftDateKey(null, profile)).toBe(
      getTodayDateKey(resolveCheckInTimeZone(null, profile))
    );
    expect(journalDraftDateKey(undefined, profile)).toBe(
      getTodayDateKey(profile)
    );
  });
});
