import { describe, expect, it } from "vitest";
import {
  canSeeLevel,
  mutualFollowAccepted,
  parseVisibility,
  resolveRecordGate,
} from "@/lib/profile-v2-visibility";

describe("parseVisibility", () => {
  it("defaults unknown values to public", () => {
    expect(parseVisibility(null)).toBe("public");
    expect(parseVisibility("FRIENDS")).toBe("friends");
    expect(parseVisibility("private")).toBe("private");
  });
});

describe("canSeeLevel", () => {
  it("owner always sees every level", () => {
    expect(canSeeLevel("private", "self")).toBe(true);
    expect(canSeeLevel("friends", "self")).toBe(true);
  });

  it("friends requires mutual accepted", () => {
    expect(canSeeLevel("friends", "accepted")).toBe(true);
    expect(canSeeLevel("friends", "none")).toBe(false);
  });

  it("private is owner only", () => {
    expect(canSeeLevel("private", "accepted")).toBe(false);
    expect(canSeeLevel("private", "none")).toBe(false);
  });
});

describe("resolveRecordGate", () => {
  it("profile-private hides challenges and activity even if those are public", () => {
    expect(
      resolveRecordGate({
        profile: "private",
        challenges: "public",
        activity: "public",
        relationship: "none",
      })
    ).toEqual({ profile: false, challenges: false, activity: false });
  });

  it("public profile can still hide activity from a stranger", () => {
    expect(
      resolveRecordGate({
        profile: "public",
        challenges: "public",
        activity: "friends",
        relationship: "none",
      })
    ).toEqual({ profile: true, challenges: true, activity: false });
  });
});

describe("mutualFollowAccepted", () => {
  it("requires both accepted rows", () => {
    expect(mutualFollowAccepted(true, false)).toBe(false);
    expect(mutualFollowAccepted(true, true)).toBe(true);
  });
});
