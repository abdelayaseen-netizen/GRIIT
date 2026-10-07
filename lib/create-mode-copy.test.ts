import { describe, expect, it } from "vitest";
import {
  MODE_HARD_BODY,
  MODE_HARD_TITLE,
  MODE_STANDARD_BODY,
  MODE_STANDARD_TITLE,
  CREATE_PRIVACY_LINE,
  GROUP_TASK_PRIVACY,
} from "@/lib/create-mode-copy";

describe("123 mode copy", () => {
  it("uses the locked titles and bodies", () => {
    expect(MODE_STANDARD_TITLE).toBe("Standard");
    expect(MODE_STANDARD_BODY).toBe(
      "Every gate blocks. A freeze covers yesterday until midnight, earned at a 7-day streak.",
    );
    expect(MODE_HARD_TITLE).toBe("Strict");
    expect(MODE_HARD_BODY).toBe(
      "A missed day resets your streak to 0. No freezes.",
    );
    expect(CREATE_PRIVACY_LINE).toContain("Photos stay private");
    expect(GROUP_TASK_PRIVACY).toBe(
      "People in a challenge with you see how many of today's tasks you've done.",
    );
  });
});
