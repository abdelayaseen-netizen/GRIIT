import { describe, expect, it } from "vitest";
import {
  MODE_HARD_BODY,
  MODE_HARD_TITLE,
  MODE_STANDARD_BODY,
  MODE_STANDARD_TITLE,
} from "@/lib/create-mode-copy";

describe("123 mode copy", () => {
  it("uses the locked titles and bodies", () => {
    expect(MODE_STANDARD_TITLE).toBe("Standard · Freezes on");
    expect(MODE_STANDARD_BODY).toBe(
      "A missed day resets your streak. The next day, you can spend a freeze to cover it. One freeze covers yesterday only. Free accounts get 1 every 30 days, Pro gets 4.",
    );
    expect(MODE_HARD_TITLE).toBe("No Days Off · No freezes");
    expect(MODE_HARD_BODY).toBe(
      "A missed day sends the run back to Day 1. Freezes can't be used.",
    );
  });
});
