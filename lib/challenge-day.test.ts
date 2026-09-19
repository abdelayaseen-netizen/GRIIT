import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { displayDay, feedPostDisplayDay } from "./challenge-day";
import { feedNoPhotoCopy } from "./feed-copy";

describe("displayDay", () => {
  it("created today, secured today → displays Day 1, feed says secured day 1", () => {
    const current_day = 2;
    const shown = displayDay(current_day, true);
    expect(shown).toBe(1);
    expect(
      feedNoPhotoCopy({
        eventType: "secured_day",
        displayName: "Maya",
        username: "maya",
        challengeName: "75 Hard Classic",
        currentDay: shown,
      })
    ).toBe("Maya secured day 1");
  });

  it("tomorrow morning unsecured → Day 2", () => {
    expect(displayDay(2, false)).toBe(2);
  });

  it("feed photo header uses displayDay like Home after a same-day secure", () => {
    expect(feedPostDisplayDay(2, "task_completed", true)).toBe(1);
    expect(feedPostDisplayDay(1, "secured_day", true)).toBe(1);
    expect(feedPostDisplayDay(3, "task_completed", false)).toBe(3);
    const card = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    expect(card).toContain("feedPostDisplayDay");
  });
});
