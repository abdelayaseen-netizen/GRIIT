import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { persistedReconcileResult, rememberReconcileResult } from "./reconcile-persist";
import {
  USE_FREEZE_FOR_YESTERDAY,
  YESTERDAY_WASNT_SECURED,
  isMissAcked,
  missAckPayload,
  morningAfterKeepsLostStreak,
  morningAfterCost,
  morningAfterCushion,
  morningAfterFreezeCaption,
  morningAfterVariant,
  morningAfterVisible,
} from "./morning-after";

describe("morningAfterVariant", () => {
  it("selects Last Stand, freeze, or reset", () => {
    expect(
      morningAfterVariant({ lastStandUsed: true, reset: true, freezeRemaining: 2, lostStreak: 9 }),
    ).toBe("last_stand");
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: true, freezeRemaining: 1, lostStreak: 6 }),
    ).toBe("freeze");
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: false, freezeRemaining: 4, lostStreak: 6 }),
    ).toBe("freeze");
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: true, freezeRemaining: 1, lostStreak: 0 }),
    ).toBe("reset");
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: true, freezeRemaining: 0, lostStreak: 6 }),
    ).toBe("reset");
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: false, freezeRemaining: 4 }),
    ).toBeNull();
    expect(
      morningAfterVariant({ lastStandUsed: false, reset: false, freezeRemaining: 0, lostStreak: 6 }),
    ).toBe("reset");
  });
});

describe("morningAfter dismiss", () => {
  it("stays dismissed for that date key and shows again on a new key", () => {
    expect(isMissAcked("2026-09-16", "2026-09-16")).toBe(true);
    expect(morningAfterVisible("reset", "2026-09-16", "2026-09-16")).toBe(false);
    expect(morningAfterVisible("reset", "2026-09-16", "2026-09-17")).toBe(true);
    expect(morningAfterVisible("reset", null, "2026-09-17")).toBe(true);
    expect(morningAfterVisible(null, null, "2026-09-17")).toBe(false);
    expect(missAckPayload("2026-09-17")).toEqual({
      key: "miss_ack_date_key",
      value: "2026-09-17",
    });
    expect(morningAfterKeepsLostStreak(6, null, "2026-09-17")).toBe(true);
    expect(morningAfterKeepsLostStreak(6, "2026-09-16", "2026-09-17")).toBe(true);
    expect(morningAfterKeepsLostStreak(6, "2026-09-17", "2026-09-17")).toBe(false);
    expect(morningAfterKeepsLostStreak(0, null, "2026-09-17")).toBe(false);
    expect(morningAfterKeepsLostStreak(undefined, null, "2026-09-17")).toBe(false);
  });
});

describe("morningAfter copy", () => {
  it("names missed tasks and keeps table strings", () => {
    expect(YESTERDAY_WASNT_SECURED).toBe("Yesterday wasn't secured.");
    expect(USE_FREEZE_FOR_YESTERDAY).toBe("Use a freeze for yesterday");
    expect(morningAfterCost(4, 6, ["Run", "Read"])).toBe("4 of 6 tasks. Run, Read.");
    expect(morningAfterCushion("reset", { longest: 12, lastStandsLeft: 0 })).toBe(
      "Your streak reset to 0. Your longest was 12 days.",
    );
    expect(morningAfterCushion("last_stand", { longest: 12, lastStandsLeft: 1 })).toBe(
      "A Last Stand covered it, so the streak continues. 1 left.",
    );
    expect(morningAfterCushion("freeze", { longest: 12, lastStandsLeft: 0 })).toBe(
      "Your streak reset to 0. A freeze can undo that for yesterday.",
    );
    expect(morningAfterFreezeCaption(1)).toBe("1 left. It refills 30 days after you use it.");
  });
});

describe("morningAfter after today is secured", () => {
  it("keeps lostStreak across remount and does not hide on todaySecured", () => {
    rememberReconcileResult("u-lost", "2026-09-17", {
      streak_broken: true,
      previous_streak: 6,
      lostStreak: 6,
    });
    expect(persistedReconcileResult("u-lost", "2026-09-17")?.lostStreak).toBe(6);
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("morningAfterKeepsLostStreak(lostStreak, missAckDateKey, yesterdayKey)");
    expect(home).toContain("yesterdayKey,");
    expect(home).not.toMatch(/if \(todaySecured\) return null/);
    const hook = readFileSync(resolve(__dirname, "./use-reconcile-streak.ts"), "utf8");
    expect(hook).toContain("persistedReconcileResult");
    expect(hook).toContain("yesterdayKey: input.yesterdayKey");
  });
});
