import { describe, expect, it } from "vitest";
import { bestLabel, freezeHoldLine, homeAction, streakNumeralSize } from "@/lib/home-top";

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

  it("writes the freeze hold line with a curly apostrophe", () => {
    expect(freezeHoldLine(12, 1)).toBe(
      "Yesterday wasn’t secured. A freeze holds your 12-day streak until midnight. 1 left.",
    );
  });
});
