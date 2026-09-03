import { describe, expect, it } from "vitest";
import { profilePrimaryName } from "@/lib/profile-display";

describe("profilePrimaryName", () => {
  it("never falls back to User — empty string so HomeHeaderV2 greets Welcome", () => {
    expect(profilePrimaryName({})).toBe("");
    expect(profilePrimaryName({ username: "user_deadbeef" })).toBe("");
    expect(profilePrimaryName({ display_name: "Yaseen" })).toBe("Yaseen");
    expect(profilePrimaryName({ username: "yaseen" })).toBe("yaseen");
    expect(profilePrimaryName({}, "local")).toBe("local");
  });
});
