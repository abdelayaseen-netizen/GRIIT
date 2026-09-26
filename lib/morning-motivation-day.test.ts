import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calendarDayFromStartAt } from "./home-day-total";
import { pickTemplate } from "./notification-copy";

describe("morning motivation day", () => {
  it("omits the day when start_at is missing so push text has no Day n", () => {
    const omitted = pickTemplate("morning_motivation", { tasks: 2 }, "2026-09-16");
    expect(omitted.body).not.toMatch(/Day \d+/);
    const src = readFileSync(resolve(__dirname, "./notifications.ts"), "utf8");
    expect(src).toContain("if (day != null) vars.day = day");
    expect(src).not.toContain("day: params.currentDay");
  });

  it("is calendarDayFromStartAt when start_at is present", () => {
    expect(
      calendarDayFromStartAt("2026-09-16T16:00:00.000Z", "UTC", "2026-09-23", 14),
    ).toBe(8);
    const src = readFileSync(resolve(__dirname, "./notifications.ts"), "utf8");
    expect(src).toContain("morningMotivationDay");
    expect(src).toContain("calendarDayFromStartAt");
    const scheduler = readFileSync(resolve(__dirname, "../hooks/useNotificationScheduler.ts"), "utf8");
    expect(scheduler).toContain("startAt");
    expect(scheduler).not.toMatch(/scheduleMorningMotivation\([\s\S]*currentDay,/);
  });
});
