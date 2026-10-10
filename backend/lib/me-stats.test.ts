import { describe, expect, it } from "vitest";
import { bestStreakRun, buildMeStats, consistencyPct, proofMethodFromMetadata, resolveStatsTimeZone, usualHour } from "./me-stats";
import { hourLabel } from "@/lib/v51-format";
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

  it("uses the device zone when the profile zone is empty, and labels 8 am", () => {
    expect(resolveStatsTimeZone(null, "America/New_York")).toBe("America/New_York");
    expect(resolveStatsTimeZone("America/Chicago", "America/New_York")).toBe("America/Chicago");
    const stats = buildMeStats({
      ...base,
      range: "7d",
      timeZone: resolveStatsTimeZone(null, "America/New_York"),
      proofs: Array.from({ length: 5 }, () => ({
        atIso: "2026-10-06T12:00:00.000Z",
        method: "self_reported" as const,
      })),
    });
    const hour = usualHour(stats.user_stats.proof_hour_histogram);
    expect(hour).toBe(8);
    expect(`Most often around ${hourLabel(hour!).trim()}.`).toBe("Most often around 8 am.");
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

  it("buckets a UTC midnight proof in the profile time zone, not as 0:00", () => {
    const stats = buildMeStats({
      ...base,
      range: "all",
      proofs: Array.from({ length: 5 }, () => ({
        atIso: "2026-10-06T04:00:00.000Z",
        method: "self_reported" as const,
      })),
    });
    expect(usualHour(stats.user_stats.proof_hour_histogram)).toBe(0);
    const evening = buildMeStats({
      ...base,
      range: "all",
      proofs: Array.from({ length: 5 }, () => ({
        atIso: "2026-10-07T00:30:00.000Z",
        method: "self_reported" as const,
      })),
    });
    expect(usualHour(evening.user_stats.proof_hour_histogram)).toBe(20);
  });

  it("counts a self-reported proof as self-reported even when a photo url is stored", () => {
    expect(
      proofMethodFromMetadata({
        verification_method: "self_reported",
        photo_url: "user/proof.jpg",
        has_photo: true,
      }),
    ).toBe("self_reported");
    expect(proofMethodFromMetadata({ verification_method: "photo" })).toBe("camera");
    expect(proofMethodFromMetadata({ photo_url: "user/proof.jpg" })).toBe("camera");
  });

  it("hides a challenge with no due days and uses the singular day", () => {
    const stats = buildMeStats({
      ...base,
      range: "7d",
      enrollments: [
        {
          id: "today",
          title: "Starts today",
          startKey: "2026-10-07",
          durationDays: 7,
          status: "running",
          finishedAt: null,
        },
        {
          id: "one",
          title: "One day",
          startKey: "2026-10-06",
          durationDays: 1,
          status: "finished",
          finishedAt: "2026-10-06",
        },
      ],
    });
    expect(stats.enrollments.map((row) => row.id)).toEqual(["one"]);
    expect(stats.enrollments[0]?.line).toBe("1 of 1 day secured.");
  });
});
