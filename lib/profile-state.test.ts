import { describe, it, expect } from "vitest";
import { computeProfileState } from "./profile-state";

describe("computeProfileState", () => {
  it("returns new_user only when both streak === 0 and postCount === 0", () => {
    expect(computeProfileState({ streak: 0, postCount: 0 })).toBe("new_user");
  });

  it("returns growing when streak > 0 but postCount = 0 (or vice versa)", () => {
    expect(computeProfileState({ streak: 1, postCount: 0 })).toBe("growing");
    expect(computeProfileState({ streak: 0, postCount: 1 })).toBe("growing");
  });

  it("returns growing for early-stage users (< 14 streak OR < 10 posts)", () => {
    expect(computeProfileState({ streak: 7, postCount: 5 })).toBe("growing");
    expect(computeProfileState({ streak: 13, postCount: 9 })).toBe("growing");
    expect(computeProfileState({ streak: 30, postCount: 5 })).toBe("growing");
    expect(computeProfileState({ streak: 5, postCount: 30 })).toBe("growing");
  });

  it("returns established when streak >= 14 AND postCount >= 10", () => {
    expect(computeProfileState({ streak: 14, postCount: 10 })).toBe("established");
    expect(computeProfileState({ streak: 23, postCount: 18 })).toBe("established");
    expect(computeProfileState({ streak: 100, postCount: 100 })).toBe("established");
  });
});

/** Keep in sync with `PROFILE_HERO_UI` in components/profile/ProfileHero.tsx */
const PROFILE_HERO_COPY = {
  bioCta: "Tell people why you're here",
  lightFirstFlame: "Light your first flame →",
  editProfile: "Edit profile",
  shareLabel: " Share",
  follow: "Follow",
  following: "Following",
  nudge: "Nudge",
} as const;

describe("ProfileHero copy (mirrors PROFILE_HERO_UI)", () => {
  it("exports canonical strings for new_user self flows", () => {
    expect(PROFILE_HERO_COPY.bioCta).toBe("Tell people why you're here");
    expect(PROFILE_HERO_COPY.lightFirstFlame).toBe("Light your first flame →");
  });

  it("defines Edit + Share for growing self", () => {
    expect(PROFILE_HERO_COPY.editProfile).toBe("Edit profile");
    expect(PROFILE_HERO_COPY.shareLabel).toContain("Share");
  });

  it("defines visitor Follow / Following / Nudge", () => {
    expect(PROFILE_HERO_COPY.follow).toBe("Follow");
    expect(PROFILE_HERO_COPY.following).toBe("Following");
    expect(PROFILE_HERO_COPY.nudge).toBe("Nudge");
  });

  it("share label preserves leading space for icon row", () => {
    expect(PROFILE_HERO_COPY.shareLabel.startsWith(" ")).toBe(true);
  });

  it("bio CTA is distinct from edit profile", () => {
    expect(PROFILE_HERO_COPY.bioCta).not.toEqual(PROFILE_HERO_COPY.editProfile);
  });

  it("light-first-flame CTA is distinct from follow", () => {
    expect(PROFILE_HERO_COPY.lightFirstFlame).not.toEqual(PROFILE_HERO_COPY.follow);
  });
});
