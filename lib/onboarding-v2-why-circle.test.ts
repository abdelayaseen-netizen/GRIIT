import { describe, expect, it } from "vitest";
import { WHY_CIRCLE_VISIBILITY } from "@/lib/onboarding-v2-why-circle";

describe("WhyCircle visibility", () => {
  it("uses the confirmed Phase 0 line", () => {
    expect(WHY_CIRCLE_VISIBILITY).toBe(
      "Everyone in the challenge sees your proof. Outside it, the challenge's visibility and your own profile settings decide who else does."
    );
  });
});
