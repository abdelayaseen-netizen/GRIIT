import { describe, expect, it } from "vitest";
import { anyTimeWindowClosedToday, enrollmentStartAt } from "@/backend/lib/late-join-window";
import { dateKeyInTimeZone } from "@/backend/lib/date-utils";
import { detailLateJoinCard, reviewLateJoinState } from "@/lib/late-join";
import { homePrestartLine, reviewLateJoinLine } from "@/lib/late-join-copy";

const TZ = "America/New_York";
const crew = {
  gates: ["camera", "time"] as const,
  gateTime: { mode: "between" as const, start: "05:00", end: "06:30" },
};

describe("116 late join", () => {
  const at124pm = new Date("2026-09-27T17:24:00.000Z"); // 13:24 EDT
  const at4am = new Date("2026-09-27T08:00:00.000Z"); // 04:00 EDT

  it("launch 5am crew at 1:24 pm → Day 1 tomorrow", () => {
    expect(anyTimeWindowClosedToday(
      [{ gate_time_mode: "between", gate_time_start: "05:00", gate_time_end: "06:30" }],
      at124pm,
      TZ,
    )).toBe(true);
    expect(dateKeyInTimeZone(enrollmentStartAt(at124pm, TZ, true), TZ)).toBe("2026-09-28");
    const review = reviewLateJoinState([crew], TZ, at124pm);
    expect(review.defer).toBe(true);
    expect(review.line).toBe(reviewLateJoinLine("5:00–6:30 am"));
    expect(review.starts.startsWith("Tomorrow, ")).toBe(true);
    expect(homePrestartLine("5am crew")).toBe(
      "5am crew · Starts tomorrow. Nothing to do today.",
    );
    expect(detailLateJoinCard("2026-09-28T04:00:00.000Z", TZ)).toContain("Day 1 is tomorrow ·");
  });

  it("By 7:00 created 21:37 → tomorrow; By 23:00 created 21:37 → today", () => {
    const at937pm = new Date("2026-09-30T01:37:00.000Z"); // 21:37 EDT
    const bySeven = {
      gates: ["time"] as const,
      gateTime: { mode: "by" as const, start: "07:00", end: null },
    };
    const byEleven = {
      gates: ["time"] as const,
      gateTime: { mode: "by" as const, start: "23:00", end: null },
    };
    expect(anyTimeWindowClosedToday(
      [{ gate_time_mode: "by", gate_time_start: "07:00" }],
      at937pm,
      TZ,
    )).toBe(true);
    expect(dateKeyInTimeZone(enrollmentStartAt(at937pm, TZ, true), TZ)).toBe("2026-09-30");
    expect(reviewLateJoinState([bySeven], TZ, at937pm).defer).toBe(true);
    expect(anyTimeWindowClosedToday(
      [{ gate_time_mode: "by", gate_time_start: "23:00" }],
      at937pm,
      TZ,
    )).toBe(false);
    expect(dateKeyInTimeZone(enrollmentStartAt(at937pm, TZ, false), TZ)).toBe("2026-09-29");
    expect(reviewLateJoinState([byEleven], TZ, at937pm).starts).toBe("Today");
  });

  it("launch at 4:00 am → Day 1 today", () => {
    expect(anyTimeWindowClosedToday(
      [{ gate_time_mode: "between", gate_time_start: "05:00", gate_time_end: "06:30" }],
      at4am,
      TZ,
    )).toBe(false);
    expect(enrollmentStartAt(at4am, TZ, false)).toBe(at4am);
    expect(reviewLateJoinState([crew], TZ, at4am).starts).toBe("Today");
  });
});
