import { describe, expect, it } from "vitest";
import { accountSavedLines } from "@/lib/onboarding-v2-account-saved";

describe("accountSavedLines", () => {
  it("lists challenge, target, reminder, and goals", () => {
    expect(
      accountSavedLines({
        challengeTitle: "Read 30 Pages",
        targetStreak: 30,
        remindersEnabled: true,
        reminderPreset: "am6",
        reminderCustom: null,
        goals: ["reading_learning", "faith_prayer"],
      })
    ).toEqual([
      "Read 30 Pages, joined",
      "30 day target",
      "Reminder at 6:00 AM",
      "Reading and learning, Faith and prayer",
    ]);
  });

  it("omits empty rows", () => {
    expect(
      accountSavedLines({
        challengeTitle: null,
        targetStreak: null,
        remindersEnabled: false,
        reminderPreset: "am6",
        reminderCustom: null,
        goals: [],
      })
    ).toEqual([]);
  });
});
