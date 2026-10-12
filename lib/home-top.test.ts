import { describe, expect, it } from "vitest";
import { DAY_ONE_SUB, DAY_ONE_WORDS, bestLabel, freezeHoldLine, homeAction, streakNumeralSize, todayNextLine } from "@/lib/home-top";

describe("home top", () => {
  it("labels the best streak and sizes the numeral", () => {
    expect(bestLabel(12, 40)).toBe("Best 40");
    expect(bestLabel(1000, 1000)).toBe("Your best");
    expect(bestLabel(14, 1280)).toBe("Best 1,280");
    expect(streakNumeralSize(999)).toBe(32);
    expect(streakNumeralSize(1000)).toBe(30);
  });

  it("picks share, freeze, or the next task", () => {
    const task = { id: "t1", title: "Read" };
    expect(homeAction({ securedToday: true, yesterdayUnsecured: true, freezesLeft: 1, nextTask: task }).kind).toBe(
      "share",
    );
    expect(
      homeAction({ securedToday: false, yesterdayUnsecured: true, freezesLeft: 1, nextTask: task }),
    ).toEqual({ kind: "freeze", label: "Use a freeze" });
    expect(
      homeAction({ securedToday: false, yesterdayUnsecured: false, freezesLeft: 1, nextTask: task }),
    ).toEqual({ kind: "task", taskId: "t1", label: "Read" });
    expect(
      homeAction({ securedToday: false, yesterdayUnsecured: false, freezesLeft: 0, nextTask: null }).kind,
    ).toBe("none");
  });

  it("writes the mid-day next line and the day 1 copy", () => {
    expect(todayNextLine("Workout", 2, 3)).toBe("Workout is next. 2 of 3 left today.");
    expect(DAY_ONE_WORDS).toBe("Nothing to break yet.");
    expect(DAY_ONE_SUB.startsWith("Secure today")).toBe(true);
  });

  it("names the streak a freeze would keep", () => {
    expect(freezeHoldLine(3, 1)).toBe("Use a freeze to keep your 3-day streak. 1 left. Until midnight.");
    expect(freezeHoldLine(12, 2)).toBe("Use a freeze to keep your 12-day streak. 2 left. Until midnight.");
  });
});
