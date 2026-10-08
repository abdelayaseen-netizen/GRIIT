import { describe, expect, it } from "vitest";
import { bestStreakRun, buildMeStats, consistencyPct, usualHour } from "./me-stats";
import { inclusiveDayCount } from "./date-utils";

describe("best streak dates", () => {
  it("an 18-day run is Sep 6 through Sep 23, not Sep 24", () => {
    const keys: string[] = [];
    let cursor = "2026-09-06";
    for (let i = 0; i < 18; i++) {
      keys.push(cursor);
      cursor = add(cursor);
    }
    const run = bestStreakRun(keys);
    expect(run).toEqual({ count: 18, start: "2026-09-06", end: "2026-09-23" });
    expect(inclusiveDayCount(run!.start, run!.end)).toBe(18);
    expect(inclusiveDayCount("2026-09-06", "2026-09-24")).toBe(19);
  });
});

function add(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

describe("range stats", () => {
  const base = {
    todayKey: "2026-10-07",
    timeZone: "America/New_York",
    currentStreak: 2,
    securedKeys: ["2026-10-05", "2026-10-06"],
    heldKeys: [] as string[],
    enrollments: [
      {
        id: "e1",
        title: "Read 30",
        startKey: "2026-10-01",
        durationDays: 30,
        status: "running" as const,
        finishedAt: null,
      },
    ],
    proofs: [] as { atIso: string; method: "camera" | "self_reported" | "apple_health" }[],
  };

  it("hides the percentage until 7 due days", () => {
    const stats = buildMeStats({ ...base, range: "7d" });
    expect(stats.user_stats.due_days).toBeLessThan(7);
    expect(consistencyPct(stats.user_stats.secured_days, stats.user_stats.due_days)).toBeNull();
  });

  it("hides the usual hour until 5 proofs", () => {
    const stats = buildMeStats({ ...base, range: "all" });
    expect(usualHour(stats.user_stats.proof_hour_histogram)).toBeNull();
  });

  it("counts a proof hour in the user's time zone", () => {
    const stats = buildMeStats({
      ...base,
      range: "all",
      proofs: Array.from({ length: 5 }, () => ({
        atIso: "2026-10-06T13:00:00.000Z",
        method: "camera" as const,
      })),
    });
    expect(usualHour(stats.user_stats.proof_hour_histogram)).toBe(9);
    expect(stats.user_stats.proofs_by_method.camera).toBe(5);
  });
});
