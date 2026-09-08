import { describe, expect, it } from "vitest";
import { feedEventCurrentDay } from "./feed-activity-hydrate";

describe("feedEventCurrentDay", () => {
  it("hydrate of a secured_day event with day_number 2 and active.current_day 6 → post.currentDay === 2", () => {
    expect(feedEventCurrentDay("secured_day", { day_number: 2 }, 6)).toBe(2);
  });
});
