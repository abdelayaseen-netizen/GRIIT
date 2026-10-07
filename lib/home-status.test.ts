import { describe, expect, it } from "vitest";
import { HOME } from "@/lib/copy";
import { homeStatus, weekSheetLine } from "./home-status";

describe("homeStatus", () => {
  it("uses one sentence for each home state", () => {
    expect(homeStatus({ hasChallenge: false, secured: false, left: 0, total: 0 })).toBe(HOME.noChallenge);
    expect(homeStatus({ hasChallenge: true, secured: true, left: 0, total: 2 })).toBe(HOME.secured);
    expect(homeStatus({ hasChallenge: true, secured: true, left: 1, total: 3 })).toBe(HOME.secured);
    expect(
      homeStatus({
        hasChallenge: true,
        secured: false,
        left: 1,
        total: 2,
        lostTask: "Read",
        lostAt: "8:00",
        otherTask: "Run",
        otherChallenge: "Dawn",
      }),
    ).toBe(HOME.lost("Read", "8:00", "Run", "Dawn"));
    expect(homeStatus({ hasChallenge: true, secured: false, left: 1, total: 2, nextTask: "Read" })).toBe(
      HOME.left1("Read"),
    );
    expect(homeStatus({ hasChallenge: true, secured: false, left: 2, total: 3 })).toBe(HOME.left(2, 3));
  });
});

describe("weekSheetLine", () => {
  it("counts only days before today", () => {
    const week = [
      { state: "secured" },
      { state: "missed" },
      { state: "frozen" },
      { state: "na" },
    ];
    expect(weekSheetLine(week, 3)).toBe("This week: 2 of 3 days secured");
    expect(weekSheetLine(week, 0)).toBeNull();
  });
});