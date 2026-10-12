import { describe, expect, it } from "vitest";
import { shouldShowSaveStreak } from "@/lib/save-streak-prompt";
import { conceptLine } from "@/lib/concept-once";

describe("shouldShowSaveStreak", () => {
  const base = {
    isAnonymous: true,
    firstTaskDone: false,
    securedDays: 0,
    aboutToPostPublic: false,
    dismissedAfterFirst: false,
    dismissedAfterSecond: false,
  };

  it("asks after the first task, then waits until the second secured day", () => {
    expect(shouldShowSaveStreak({ ...base, firstTaskDone: true })).toBe(true);
    expect(shouldShowSaveStreak({ ...base, firstTaskDone: true, dismissedAfterFirst: true })).toBe(false);
    expect(
      shouldShowSaveStreak({ ...base, firstTaskDone: true, dismissedAfterFirst: true, securedDays: 2 })
    ).toBe(true);
  });

  it("asks again before a public post, and never asks a real account", () => {
    expect(shouldShowSaveStreak({ ...base, aboutToPostPublic: true, dismissedAfterSecond: true })).toBe(true);
    expect(shouldShowSaveStreak({ ...base, isAnonymous: false, firstTaskDone: true })).toBe(false);
  });
});

describe("concept lines", () => {
  it("shows each line once", () => {
    expect(conceptLine("secured", new Set())).toBe("Day secured: every task done.");
    expect(conceptLine("secured", new Set(["secured"]))).toBeNull();
    expect(conceptLine("self", new Set())).toContain("you mark it yourself");
  });
});
