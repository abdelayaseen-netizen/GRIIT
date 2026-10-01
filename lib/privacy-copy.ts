/**
 * v42.1 section 7 privacy strings. Friends = mutual follow.
 * Public / Private profile and challenges lines are unchanged.
 */
import type { VisibilityLevel } from "@/lib/profile-v2-visibility";

export const PROFILE_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can open your profile and see your bio, stats and activity.",
  friends:
    "Only people you follow who follow you back see the record. Others see your name, photo and bio only.",
  private: "Nobody but you. You still appear to people inside challenges you share.",
};

export const CHALLENGE_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can see which challenges you are running and how far in you are.",
  friends:
    "Only people you follow who follow you back see your runs. Others see the tab as hidden.",
  private: "Your runs are hidden from your profile entirely.",
};

export const ACTIVITY_COPY: Record<VisibilityLevel, string> = {
  public: "Anyone can see your calendar and the proofs you shared.",
  friends:
    "People you follow who follow you back can see your calendar and the proofs you shared.",
  private: "Only you see your calendar and proofs.",
};

export const PRIVACY_HONESTY_TITLE = "Photos stay private until you share them.";
export const PRIVACY_HONESTY_BODY =
  "Challenge members see whether you finished the day, never a photo you kept.";

export const ONBOARDING_WHO_SEES =
  "Your proof stays private until you share it.";

/** Visitor lock when the profile is friends-only. */
export function visitorFriendsLockBody(name: string): string {
  return `${name} shows the streak, activity and proofs to people they follow who follow them back. Follow to see the record.`;
}
