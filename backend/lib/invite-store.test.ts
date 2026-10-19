import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { inviteLandingCount } from "./invite-store";

describe("12b.4 invite landing count leaves out is_test people", () => {
  it("two real and three test enrollments show 2", () => {
    const enrolled = ["r1", "r2", "t1", "t2", "t3"];
    expect(inviteLandingCount(enrolled, new Set(["t1", "t2", "t3"]), 5)).toBe(2);
  });

  it("a stored count above the live rows keeps its real part only", () => {
    expect(inviteLandingCount(["r1", "t1"], new Set(["t1"]), 4)).toBe(3);
  });

  it("nobody real joined shows 0", () => {
    expect(inviteLandingCount(["t1"], new Set(["t1"]), 1)).toBe(0);
  });

  it("the landing loader looks up is_test for the enrolled people", () => {
    const src = readFileSync(resolve(__dirname, "./invite-store.ts"), "utf8");
    expect(src).toMatch(/testAuthorIdSet\(service, enrolledIds\)/);
    expect(src).toMatch(/participantsCount: inviteLandingCount\(/);
  });
});
