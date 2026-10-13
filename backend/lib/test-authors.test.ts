import { describe, expect, it } from "vitest";
import { isHiddenFromRealViewers, participantCountWithoutTest } from "@/backend/lib/test-authors";

describe("hidden accounts", () => {
  it("hides is_test profiles and the unflagged App Review display name", () => {
    expect(isHiddenFromRealViewers({ is_test: true, display_name: "Seed" })).toBe(true);
    expect(isHiddenFromRealViewers({ is_test: false, display_name: "App Review" })).toBe(true);
    expect(isHiddenFromRealViewers({ is_test: false, display_name: "A real person" })).toBe(false);
  });

  it("drops test enrollments from a discover count and never goes below zero", () => {
    expect(participantCountWithoutTest(12, 2)).toBe(10);
    expect(participantCountWithoutTest(1, 4)).toBe(0);
  });
});
