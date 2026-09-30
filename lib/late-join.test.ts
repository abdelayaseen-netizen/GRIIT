import { describe, expect, it } from "vitest";
import { anyTimeWindowClosedToday, enrollmentStartAt } from "@/backend/lib/join-challenge";
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
