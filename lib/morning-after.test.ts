import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { persistedReconcileResult, rememberReconcileResult } from "./reconcile-persist";
import {
  USE_FREEZE_FOR_YESTERDAY,
  YESTERDAY_WASNT_SECURED,
  isMissAcked,
  MISS_ACK_STORAGE_KEY,
  missAckKeysToClear,
  missAckPayload,
  missAckStorageKey,
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
    expect(missAckPayload("user-a", "2026-09-17")).toEqual({
      key: "miss_ack_date_key:user-a",
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

describe("morningAfter ack storage", () => {
  it("scopes the key per user and clears scoped plus legacy on sign-out", () => {
    const a = missAckPayload("user-a", "2026-09-17");
    const b = missAckPayload("user-b", "2026-09-17");
    expect(a.key).toBe(missAckStorageKey("user-a"));
    expect(b.key).toBe("miss_ack_date_key:user-b");
    expect(a.key).not.toBe(b.key);
    expect(morningAfterVisible("freeze", a.value, "2026-09-17")).toBe(false);
    expect(morningAfterVisible("freeze", null, "2026-09-17")).toBe(true);

    const store = new Map<string, string>([
      [MISS_ACK_STORAGE_KEY, "2026-09-17"],
      [a.key, a.value],
      [b.key, b.value],
    ]);
    for (const key of missAckKeysToClear("user-a")) store.delete(key);
    expect(store.has(MISS_ACK_STORAGE_KEY)).toBe(false);
    expect(store.has(a.key)).toBe(false);
    expect(store.get(b.key)).toBe("2026-09-17");

    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("missAckPayload(user.id, yesterdayKey)");
    expect(home).toContain("missAckStorageKey(user.id)");
    expect(home).toContain("AsyncStorage.removeItem(MISS_ACK_STORAGE_KEY)");
    expect(home).toContain("AsyncStorage.getItem(scopedKey)");
    const cleanup = readFileSync(resolve(__dirname, "./signout-cleanup.ts"), "utf8");
    expect(cleanup).toContain("missAckKeysToClear(userId)");
    expect(cleanup).toContain("AsyncStorage.removeItem(key)");
    expect(cleanup).toContain("runClientSignOutCleanup(userId?: string | null)");
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
