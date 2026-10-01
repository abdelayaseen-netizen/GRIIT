import { describe, expect, it } from "vitest";
import { WHY_CIRCLE_VISIBILITY } from "@/lib/onboarding-v2-why-circle";

describe("WhyCircle visibility", () => {
  it("uses the confirmed Phase 0 line", () => {
    expect(WHY_CIRCLE_VISIBILITY).toBe(
      "People you follow see what you share. Your proof stays private until you share it.",
    );
  });
});
