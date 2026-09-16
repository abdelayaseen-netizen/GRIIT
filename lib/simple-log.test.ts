import { describe, it, expect } from "vitest";
import {
  formatSecuredKeepCount,
  formatSecuredStateLine,
  formatSimpleSecuredMeta,
  SAVING_TAKEOVER_HEADING,
  SECURED_DONE,
  SECURED_PILL_CAMERA,
  SECURED_PILL_SELF,
  SECURED_STREAK_LABEL,
  SECURED_TODAY_PROOF,
  SELF_REPORT_RECORDS_HEADING,
  SELF_REPORT_RECORDS_ROWS,
  SIMPLE_ASK_CAPTION,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_HEADING,
  SIMPLE_ASK_HONESTY,
  SIMPLE_ASK_NOT_YET,
  SIMPLE_ASK_SAVING,
} from "./simple-log";

describe("simple Ask copy", () => {
  it("locks Ask strings verbatim", () => {
    expect(SIMPLE_ASK_HEADING).toBe("Did you do it today?");
    expect(SIMPLE_ASK_HONESTY).toBe("Self-reported. Nothing is checked.");
    expect(SIMPLE_ASK_CTA).toBe("I did it");
    expect(SIMPLE_ASK_SAVING).toBe("Saving…");
    expect(SIMPLE_ASK_CAPTION).toBe("Nothing is secured until the server says so.");
    expect(SIMPLE_ASK_NOT_YET).toBe("Not yet");
    expect(SELF_REPORT_RECORDS_HEADING).toBe("What this records");
    expect(SELF_REPORT_RECORDS_ROWS).toEqual([
      "Today is marked done for this task",
      "Your challenge sees it as self-reported",
      "No camera, no time window, no location",
    ]);
  });
});

describe("secured copy", () => {
  it("locks Secured strings verbatim", () => {
    expect(SECURED_STREAK_LABEL).toBe("Current streak");
    expect(formatSecuredStateLine(3, false)).toBe("Day 3. Self reported.");
    expect(formatSecuredStateLine(3, true)).toBe("Day 3. Camera proof.");
    expect(SECURED_PILL_SELF).toBe("Self-reported. Nothing was checked.");
    expect(SECURED_PILL_CAMERA).toBe("Camera proof. Checked on the server.");
    expect(SECURED_TODAY_PROOF).toBe("Today's proof");
    expect(formatSecuredKeepCount(4)).toBe("4 more days this week to keep the count.");
    expect(SECURED_DONE).toBe("Done");
    expect(SAVING_TAKEOVER_HEADING).toBe("Saving your day");
  });
});

describe("formatSimpleSecuredMeta", () => {
  it("locks Secured meta verbatim — no verifying fiction", () => {
    expect(formatSimpleSecuredMeta()).toBe("Self-reported · nothing checked");
  });
});
