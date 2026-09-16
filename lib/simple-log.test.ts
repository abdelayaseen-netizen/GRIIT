import { describe, it, expect } from "vitest";
import {
  formatSimpleSecuredMeta,
  SELF_REPORT_RECORDS_HEADING,
  SELF_REPORT_RECORDS_ROWS,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_HEADING,
  SIMPLE_ASK_HONESTY,
  SIMPLE_ASK_NOT_YET,
} from "./simple-log";

describe("simple Ask copy", () => {
  it("locks Ask strings verbatim", () => {
    expect(SIMPLE_ASK_HEADING).toBe("Did you do it today?");
    expect(SIMPLE_ASK_HONESTY).toBe("Self-reported. Nothing is checked.");
    expect(SIMPLE_ASK_CTA).toBe("I did it");
    expect(SIMPLE_ASK_NOT_YET).toBe("Not yet");
    expect(SELF_REPORT_RECORDS_HEADING).toBe("What this records");
    expect(SELF_REPORT_RECORDS_ROWS).toEqual([
      "You said you did it",
      "Nothing is checked",
      "No camera proof",
    ]);
  });
});

describe("formatSimpleSecuredMeta", () => {
  it("locks Secured meta verbatim — no verifying fiction", () => {
    expect(formatSimpleSecuredMeta()).toBe("Self-reported · nothing checked");
  });
});
