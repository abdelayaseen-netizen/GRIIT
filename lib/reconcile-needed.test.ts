import { describe, expect, it } from "vitest";
import { reconcileStreakNeeded } from "@/lib/reconcile-needed";

describe("reconcileStreakNeeded", () => {
  it("is false until the bootstrap (or equivalent) has settled", () => {
    expect(
      reconcileStreakNeeded({
        ready: false,
        stats: { lastCompletedDateKey: "2026-09-11", effectiveMissedDays: 1 },
        securedDateKeys: ["2026-09-11"],
      })
    ).toBe(false);
  });

  it("live count mismatch is not a reconcile need when last_completed matches keys", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          lastCompletedDateKey: "2026-09-13",
          effectiveMissedDays: 0,
        },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(false);
  });

  it("aligned yesterday secure, no miss, does not reconcile", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          lastCompletedDateKey: "2026-09-13",
          effectiveMissedDays: 0,
        },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(false);
  });

  it("effectiveMissedDays >= 1 is the getStats write condition", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          lastCompletedDateKey: "2026-09-11",
          effectiveMissedDays: 1,
        },
        securedDateKeys: ["2026-09-11"],
      })
    ).toBe(true);
  });

  it("streak last_completed behind a secured key", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          lastCompletedDateKey: "2026-09-11",
          effectiveMissedDays: 0,
        },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(true);
  });

  it("missing last_completed with a secured key", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: { lastCompletedDateKey: null, effectiveMissedDays: 0 },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(true);
  });

  it("Last Stand receipt still reconciles so yesterday's tally is on the return", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          lastCompletedDateKey: "2026-09-16",
          effectiveMissedDays: 0,
          lastStandUsedThisSession: true,
        },
        securedDateKeys: ["2026-09-15"],
      })
    ).toBe(true);
  });
});
