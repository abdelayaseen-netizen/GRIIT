import { describe, expect, it } from "vitest";
import { g2aPushCandidates } from "@/lib/g2a-notifications";

describe("g2a day pushes", () => {
  it("cancels to empty when the day is secured and never exceeds two", () => {
    const now = new Date("2026-10-02T08:00:00");
    expect(
      g2aPushCandidates({
        now,
        securedToday: true,
        challengeLine: "Crew · Day 2 of 30",
        eveningBody: "1 tasks left today. Your streak is 1 days.",
        morningBody: "Secure today and it's 2.",
      }),
    ).toEqual([]);
    const close = new Date("2026-10-02T12:00:00");
    const open = g2aPushCandidates({
      now,
      securedToday: false,
      windowCloseAt: close,
      windowBody: "Read window closes at 12:00 pm. Your streak is 1 days.",
      challengeLine: "Crew · Day 2 of 30",
      eveningBody: "1 tasks left today. Your streak is 1 days.",
      morningBody: "Secure today and it's 2.",
    });
    expect(open).toHaveLength(2);
    expect(open[0]?.body).toContain("window closes");
    expect(open[1]?.body).toContain("tasks left");
  });
});
