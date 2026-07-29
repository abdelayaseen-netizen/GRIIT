import { describe, it, expect } from "vitest";
import {
  formatSimpleSecuredMeta,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_HEADING,
  SIMPLE_ASK_INFO,
  SIMPLE_ASK_NOT_YET,
} from "./simple-log";

describe("simple Ask copy", () => {
  it("locks Ask strings verbatim", () => {
    expect(SIMPLE_ASK_HEADING).toBe("Did you do it today?");
    expect(SIMPLE_ASK_INFO).toBe("Self-report. Nothing is checked.");
    expect(SIMPLE_ASK_CTA).toBe("I did it");
    expect(SIMPLE_ASK_NOT_YET).toBe("Not yet");
  });
});

describe("formatSimpleSecuredMeta", () => {
  it("locks Secured meta verbatim — no verifying fiction", () => {
    expect(formatSimpleSecuredMeta()).toBe("Self-reported · nothing checked");
  });
});
