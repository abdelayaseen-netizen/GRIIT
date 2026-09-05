import { describe, expect, it } from "vitest";
import { profilePrimaryName } from "@/lib/profile-display";

describe("profilePrimaryName", () => {
  it("display name → username → nothing; never the email prefix", () => {
    expect(profilePrimaryName({})).toBe("");
    expect(profilePrimaryName({ username: "user_deadbeef" })).toBe("");
    expect(profilePrimaryName({ display_name: "Yaseen" })).toBe("Yaseen");
    expect(profilePrimaryName({ username: "yaseen" })).toBe("yaseen");
    expect(profilePrimaryName({}, "local")).toBe("");
    expect(profilePrimaryName({ username: "user_280c07a4" }, "yaseen")).toBe("");
  });
});
