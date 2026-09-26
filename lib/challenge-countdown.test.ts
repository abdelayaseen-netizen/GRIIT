import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { challengeCountdownFromStart } from "./challenge-countdown";

describe("challengeCountdownFromStart", () => {
  it("does not schedule when start_at is missing", () => {
    expect(
      challengeCountdownFromStart({
        startAt: null,
        timeZone: "UTC",
        todayKey: "2026-09-23",
        durationDays: 14,
      }),
    ).toBeNull();
    const src = readFileSync(resolve(__dirname, "./notifications.ts"), "utf8");
    expect(src).toContain("if (!countdown) continue");
    expect(src).not.toContain("day: ch.currentDay");
  });

  it("uses calendarDayFromStartAt for You're {day}/{total}", () => {
    expect(
      challengeCountdownFromStart({
        startAt: "2026-09-16T16:00:00.000Z",
        timeZone: "UTC",
        todayKey: "2026-09-23",
        durationDays: 14,
      }),
    ).toBeNull();
    expect(
      challengeCountdownFromStart({
        startAt: "2026-09-16T16:00:00.000Z",
        timeZone: "UTC",
        todayKey: "2026-09-25",
        durationDays: 14,
      }),
    ).toEqual({ day: 10, daysLeft: 4 });
    const scheduler = readFileSync(
      resolve(__dirname, "../hooks/useNotificationScheduler.ts"),
      "utf8",
    );
    expect(scheduler).toContain("startAt: ac.start_at");
    expect(scheduler).not.toContain("currentDay: ac.current_day");
  });
});
