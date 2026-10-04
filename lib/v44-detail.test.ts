import { describe, expect, it } from "vitest";
import {
  COPY_LINK,
  INVITE_MEMBERS,
  KEPT_PROOFS_BODY,
  NO_SHARED_PROOFS_IN_CHALLENGE,
  PEOPLE_SOLO,
  detailMetaLine,
  recordOfDue,
  streakSheetFreezeLeft,
  streakSheetMissBody,
  useFreezeForWeekday,
  weekdayHeldBody,
  weekdayHeldTitle,
} from "@/lib/v44-detail";

describe("v44 challenge detail", () => {
  it("names the day, who, and the mode", () => {
    expect(detailMetaLine({ day: 12, total: 30, group: false, hard: false })).toBe(
      "Day 12 of 30 · Solo · Standard",
    );
    expect(detailMetaLine({ day: 3, total: 14, group: true, hard: true })).toBe(
      "Day 3 of 14 · Group · No Days Off",
    );
    expect(PEOPLE_SOLO).toBe("Just you so far · 1 of 10");
    expect(INVITE_MEMBERS(4)).toBe("4 of 10. They start at Day 1.");
    expect(COPY_LINK).toBe("Copy link");
    expect(NO_SHARED_PROOFS_IN_CHALLENGE).toContain("No shared proofs");
    expect(recordOfDue(8, 12)).toBe("of 12 days secured");
    expect(KEPT_PROOFS_BODY).toContain("with a lock");
  });

  it("writes the streak sheet and the held confirmation", () => {
    expect(
      streakSheetMissBody({
        done: 1,
        total: 3,
        missed: "Gym",
        weekday: "Friday",
        streak: 6,
      }),
    ).toContain("today makes it 7");
    expect(streakSheetFreezeLeft(1, "2 November")).toBe(
      "1 freeze left. Next one on 2 November. Available until midnight tonight.",
    );
    expect(useFreezeForWeekday("Friday")).toBe("Use a freeze for Friday");
    expect(weekdayHeldTitle("Friday")).toBe("Friday is held.");
    expect(weekdayHeldBody(6, 0, "2 November")).toContain("Secure today and it's 7");
  });
});
