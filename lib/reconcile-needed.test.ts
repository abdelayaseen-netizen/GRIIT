import { describe, expect, it } from "vitest";
import { reconcileStreakNeeded } from "@/lib/reconcile-needed";

/** Live prod bootstrap 2026-09-14: stats 0, profile 1, one secured day (yesterday). */
const LIVE = {
  ready: true,
  stats: { totalDaysSecured: 0 },
  profile: { total_days_secured: 1 },
  securedDateKeys: ["2026-09-13"],
} as const;

describe("reconcileStreakNeeded", () => {
  it("is false until the bootstrap (or equivalent) has settled", () => {
    expect(reconcileStreakNeeded({ ...LIVE, ready: false })).toBe(false);
  });

  it("live payload: stats.totalDaysSecured=0 vs profile.total_days_secured=1", () => {
    expect(reconcileStreakNeeded(LIVE)).toBe(true);
  });

  it("live payload still needed when profile is missing and only keys prove a secure", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: { totalDaysSecured: 0 },
        profile: null,
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(true);
  });

  it("aligned yesterday secure, no miss, does not reconcile", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          totalDaysSecured: 1,
          lastCompletedDateKey: "2026-09-13",
          effectiveMissedDays: 0,
        },
        profile: { total_days_secured: 1 },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(false);
  });

  it("effectiveMissedDays >= 1 is the getStats write condition", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          totalDaysSecured: 1,
          lastCompletedDateKey: "2026-09-11",
          effectiveMissedDays: 1,
        },
        profile: { total_days_secured: 1 },
        securedDateKeys: ["2026-09-11"],
      })
    ).toBe(true);
  });

  it("streak last_completed behind a secured key", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: {
          totalDaysSecured: 1,
          lastCompletedDateKey: "2026-09-11",
          effectiveMissedDays: 0,
        },
        profile: { total_days_secured: 1 },
        securedDateKeys: ["2026-09-13"],
      })
    ).toBe(true);
  });
});
