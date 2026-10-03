import { describe, expect, it } from "vitest";
import {
  canSeeProfileContent,
  isPrivateAccount,
  visibilitiesForPrivateSwitch,
} from "@/lib/profile-privacy";

const PUBLIC = {
  user_id: "owner",
  profile_visibility: "public",
  challenge_visibility: "public",
  activity_visibility: "public",
};

const PRIVATE = {
  user_id: "owner",
  profile_visibility: "private",
  challenge_visibility: "public",
  activity_visibility: "public",
};

const FRIENDS_ONLY = {
  user_id: "owner",
  profile_visibility: "friends",
  challenge_visibility: "public",
  activity_visibility: "public",
};

describe("isPrivateAccount", () => {
  it("is public when every visibility is public or empty", () => {
    expect(isPrivateAccount(PUBLIC)).toBe(false);
    expect(isPrivateAccount({ user_id: "o" })).toBe(false);
  });

  it("is private if any field is private or friends (case-insensitive)", () => {
    expect(isPrivateAccount(PRIVATE)).toBe(true);
    expect(isPrivateAccount(FRIENDS_ONLY)).toBe(true);
    expect(
      isPrivateAccount({
        user_id: "o",
        profile_visibility: "PUBLIC",
        challenge_visibility: "Friends",
        activity_visibility: "public",
      }),
    ).toBe(true);
    expect(
      isPrivateAccount({
        user_id: "o",
        profile_visibility: "public",
        challenge_visibility: "public",
        activity_visibility: "PRIVATE",
      }),
    ).toBe(true);
  });
});

describe("canSeeProfileContent", () => {
  it("public: anyone can see", () => {
    expect(canSeeProfileContent("stranger", PUBLIC, { isMutual: false, isCoMember: false })).toBe(
      true,
    );
  });

  it("private-stranger: hidden", () => {
    expect(canSeeProfileContent("stranger", PRIVATE, { isMutual: false, isCoMember: false })).toBe(
      false,
    );
  });

  it("private-one-way-follower: hidden", () => {
    expect(canSeeProfileContent("follower", PRIVATE, { isMutual: false, isCoMember: false })).toBe(
      false,
    );
  });

  it("mutual: visible", () => {
    expect(canSeeProfileContent("friend", PRIVATE, { isMutual: true, isCoMember: false })).toBe(
      true,
    );
  });

  it("co-member: visible", () => {
    expect(canSeeProfileContent("teammate", PRIVATE, { isMutual: false, isCoMember: true })).toBe(
      true,
    );
  });

  it("self: always visible", () => {
    expect(canSeeProfileContent("owner", PRIVATE, { isMutual: false, isCoMember: false })).toBe(
      true,
    );
    expect(canSeeProfileContent({ id: "owner" }, PRIVATE, {})).toBe(true);
  });
});

describe("visibilitiesForPrivateSwitch", () => {
  it("writes all three columns to private or public", () => {
    expect(visibilitiesForPrivateSwitch(true)).toEqual({
      profile_visibility: "private",
      challenge_visibility: "private",
      activity_visibility: "private",
    });
    expect(visibilitiesForPrivateSwitch(false)).toEqual({
      profile_visibility: "public",
      challenge_visibility: "public",
      activity_visibility: "public",
    });
  });
});
