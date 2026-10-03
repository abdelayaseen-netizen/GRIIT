import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_COPY,
  CHALLENGE_COPY,
  ONBOARDING_WHO_SEES,
  PRIVACY_HONESTY_BODY,
  PRIVACY_HONESTY_TITLE,
  PROFILE_COPY,
  visitorFriendsLockBody,
} from "@/lib/privacy-copy";

describe("v42.1 privacy copy", () => {
  it("Friends lines are mutual follow", () => {
    expect(PROFILE_COPY.friends).toBe(
      "Only people you follow who follow you back see the record. Others see your name, photo and bio only.",
    );
    expect(CHALLENGE_COPY.friends).toBe(
      "Only people you follow who follow you back see your runs. Others see the tab as hidden.",
    );
    expect(ACTIVITY_COPY.friends).toBe(
      "People you follow who follow you back can see your calendar and the proofs you shared.",
    );
    expect(visitorFriendsLockBody("Maya")).toBe(
      "Maya shows the streak, activity and proofs to people they follow who follow them back. Follow to see the record.",
    );
  });

  it("Activity and honesty drop 365-day / verified the day", () => {
    expect(ACTIVITY_COPY.public).toBe("Anyone can see your calendar and the proofs you shared.");
    expect(ACTIVITY_COPY.private).toBe("Only you see your calendar and proofs.");
    expect(PRIVACY_HONESTY_TITLE).toBe("Photos stay private until you share them.");
    expect(PRIVACY_HONESTY_BODY).toBe(
      "Challenge members see whether you finished the day, never a photo you kept.",
    );
    expect(ONBOARDING_WHO_SEES).toBe("Your proof stays private until you share it.");
  });

  it("settings and visitor profile bind the shared copy", () => {
    const settings = readFileSync(resolve(__dirname, "../app/settings/privacy.tsx"), "utf8");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    expect(settings).toContain("SEE_STRANGER");
    expect(settings).toContain("SWITCH_NEVER_SHARES_KEPT");
    expect(settings).toContain("PHOTOS_STAY_PRIVATE");
    expect(settings).toContain("visibilitiesForPrivateSwitch");
    expect(settings).not.toContain("365-day");
    expect(settings).not.toContain("verified the day");
    expect(visitor).toContain("ACCOUNT_PRIVATE");
    expect(visitor).toContain("STRANGER_BANNER");
    expect(visitor).not.toContain("people they have accepted");
  });

  it("spec 120 is is_anonymous, not username", () => {
    const authors = readFileSync(resolve(__dirname, "../backend/lib/anonymous-authors.ts"), "utf8");
    expect(authors).toContain("Spec 120 resolved: is_anonymous");
    expect(authors).toContain("do not filter usernames");
    const screens = readFileSync(
      resolve(__dirname, "../design/handoff/cursor/02_screens.md"),
      "utf8",
    );
    expect(screens).toContain("Resolved: is_anonymous");
    expect(screens).not.toMatch(/\*\*120\.\*\*[\s\S]*username is null/);
  });
});
