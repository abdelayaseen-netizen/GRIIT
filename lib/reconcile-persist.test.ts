import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  clearReconcilePersist,
  persistedReconcileResult,
  reconcilePersistKey,
  rememberReconcileResult,
} from "./reconcile-persist";

describe("reconcile persist", () => {
  it("keys by userId + date key and never returns A for B", () => {
    clearReconcilePersist();
    rememberReconcileResult("user-a", "2026-09-17", {
      streak_broken: true,
      previous_streak: 6,
      lostStreak: 6,
    });
    expect(reconcilePersistKey("user-a", "2026-09-17")).toBe("user-a:2026-09-17");
    expect(persistedReconcileResult("user-a", "2026-09-17")?.lostStreak).toBe(6);
    expect(persistedReconcileResult("user-b", "2026-09-17")).toBeNull();
    expect(persistedReconcileResult("user-a", "2026-09-16")).toBeNull();
    clearReconcilePersist();
    expect(persistedReconcileResult("user-a", "2026-09-17")).toBeNull();
    const hook = readFileSync(resolve(__dirname, "./use-reconcile-streak.ts"), "utf8");
    expect(hook).toContain("clearReconcilePersist()");
    expect(hook).toContain("persistedReconcileResult(input.userId, input.yesterdayKey)");
    const cleanup = readFileSync(resolve(__dirname, "./signout-cleanup.ts"), "utf8");
    expect(cleanup).toContain("clearReconcilePersist()");
  });
});
