import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dayCellFromProofsDay,
  dayCellFromWeekState,
  leadingBlanksMondayFirst,
  monthTitle,
} from "@/lib/day-cell";

describe("shared day-cell", () => {
  it("visitor never gets a lock or a private photo", () => {
    const privateDay = dayCellFromProofsDay(
      { date: "2026-09-26", state: "camera", cover_url: "https://cdn/p.jpg", shared: false },
      "visitor",
    );
    expect(privateDay.kind).toBe("self");
    expect(privateDay.lock).toBe(false);
    expect(privateDay.coverUrl).toBeNull();
    const owner = dayCellFromProofsDay(
      { date: "2026-09-26", state: "camera", cover_url: "https://cdn/p.jpg", shared: false },
      "owner",
    );
    expect(owner.kind).toBe("private");
    expect(owner.lock).toBe(true);
    expect(dayCellFromProofsDay({ date: "2026-09-24", state: "camera", cover_url: null, shared: true }, "owner").kind).toBe(
      "photo_missing",
    );
  });

  it("week strip and calendar share DayCell", () => {
    expect(dayCellFromWeekState("secured", false)).toBe("self");
    expect(dayCellFromWeekState("frozen", false)).toBe("freeze");
    expect(dayCellFromWeekState("last_stand", false)).toBe("last_stand");
    expect(dayCellFromWeekState("missed", true)).toBe("today");
    expect(monthTitle("2026-09")).toBe("September 2026");
    expect(leadingBlanksMondayFirst("2026-09")).toBe(1);
    const week = readFileSync(resolve(__dirname, "../components/ds/WeekStrip.tsx"), "utf8");
    const cal = readFileSync(resolve(__dirname, "../components/profile/ProofsCalendar.tsx"), "utf8");
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    expect(week).toContain("DayCell");
    expect(cal).toContain("DayCell");
    expect(cal).toContain("header.secured");
    expect(own).toContain("ProofsCalendar");
    expect(own).not.toContain("ProofDaysGrid");
    expect(visitor).toContain('viewer={isSelf ? "owner" : "visitor"}');
    expect(visitor).not.toContain("ProofDaysGrid");
    expect(cal).toContain("lock={viewer === \"owner\" && model.lock}");
  });
});
