import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assembleSubmitResult,
  pickConfirmationChallengeDay,
  pickConfirmationCopy,
  pickConfirmationVariant,
} from "@/lib/task-completion-result";
import { canOpenSecuredScreen, securedNavOnce } from "@/lib/task-secured-nav";

describe("pickConfirmationChallengeDay", () => {
  it("uses the pre-secure snapshot, not the incremented secureDay value (Q13)", () => {
    expect(pickConfirmationChallengeDay({ dayFromComplete: 3, dayFromSecureAfter: 4 })).toBe(3);
    expect(pickConfirmationChallengeDay({ dayFromComplete: 1, dayFromSecureAfter: 2 })).toBe(1);
  });
});

describe("pickConfirmationVariant", () => {
  it("maps A/B/C/D from server fields", () => {
    expect(
      pickConfirmationVariant({ verificationKind: "live_photo", daySecured: true, daySecuredEarlier: false })
    ).toBe("A");
    expect(
      pickConfirmationVariant({ verificationKind: "live_photo", daySecured: false, daySecuredEarlier: false })
    ).toBe("B");
    expect(
      pickConfirmationVariant({ verificationKind: "live_photo", daySecured: true, daySecuredEarlier: true })
    ).toBe("C");
    expect(
      pickConfirmationVariant({ verificationKind: "self_report", daySecured: true, daySecuredEarlier: false })
    ).toBe("D");
  });
});

describe("pickConfirmationCopy", () => {
  it("optional-task copy does not claim a streak move (Q12)", () => {
    expect(
      pickConfirmationCopy({
        daySecured: false,
        daySecuredEarlier: false,
        requiredRemaining: 2,
        optional: true,
      })
    ).toEqual({
      headline: "Task done",
      footnote: "This task is optional. It does not move the streak.",
    });
  });
});

describe("assembleSubmitResult", () => {
  it("keeps challengeDay at the complete snapshot after secureDay increments", () => {
    const result = assembleSubmitResult({
      verificationKind: "timer",
      requiredRemaining: 0,
      dayAlreadySecured: false,
      streakDaysBefore: 13,
      challengeDayBeforeSecure: 3,
      challengeLength: 14,
      challengeName: "Consistent Bedtime",
      secure: { success: true, alreadySecured: false, newStreakCount: 14, secured: true },
    });
    expect(result.challengeDay).toBe(3);
    expect(result.daySecured).toBe(true);
    expect(result.daySecuredEarlier).toBe(false);
    expect(result.streakDays).toBe(14);
  });

  it("Day n is displayDay of the post-secure current_day, matching Home", () => {
    const firstDay = assembleSubmitResult({
      verificationKind: "live_photo",
      requiredRemaining: 0,
      dayAlreadySecured: false,
      streakDaysBefore: 0,
      challengeDayBeforeSecure: 1,
      challengeLength: 14,
      challengeName: "Run",
      secure: { success: true, alreadySecured: false, newStreakCount: 1, secured: true },
    });
    expect(firstDay.streakDays).toBe(1);
    expect(firstDay.challengeDay).toBe(1);
    expect(firstDay.challengeDay).not.toBe(2);
  });

  it("marks already-secured days as C, not a new secure", () => {
    const result = assembleSubmitResult({
      verificationKind: "live_photo",
      requiredRemaining: 0,
      dayAlreadySecured: true,
      streakDaysBefore: 14,
      challengeDayBeforeSecure: 3,
      challengeLength: 14,
      challengeName: "Consistent Bedtime",
      secure: { success: true, alreadySecured: true, newStreakCount: 14, secured: true },
    });
    expect(result.daySecuredEarlier).toBe(true);
    expect(pickConfirmationVariant(result)).toBe("C");
  });

  it("challenge_done without user secure does not mark the day secured", () => {
    const result = assembleSubmitResult({
      verificationKind: "timer",
      requiredRemaining: 0,
      dayAlreadySecured: false,
      streakDaysBefore: 4,
      challengeDayBeforeSecure: 1,
      challengeLength: 14,
      challengeName: "Write",
      secure: {
        success: true,
        alreadySecured: false,
        newStreakCount: 4,
        secured: false,
        challenge_done: true,
        remaining_challenges: 2,
      },
    });
    expect(result.daySecured).toBe(false);
    expect(result.streakDays).toBe(4);
  });
});

describe("secured navigation", () => {
  it("replaces once after the server streak; never opens on a pre-response 0", () => {
    expect(canOpenSecuredScreen({ daySecured: true, newStreakCount: 1 })).toBe(true);
    expect(canOpenSecuredScreen({ daySecured: true })).toBe(false);
    expect(canOpenSecuredScreen({ daySecured: true, newStreakCount: 0 })).toBe(false);
    expect(canOpenSecuredScreen({ daySecured: false, newStreakCount: 1 })).toBe(false);
    expect(securedNavOnce()).toBe("replace");
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(flow).toContain("submitInFlight");
    expect(flow).toContain("router.replace(");
    expect(flow).toContain("taskSecuredHref(");
    expect(flow).not.toContain("router.push(taskSecuredHref");
    expect(flow).not.toContain('setStep("confirmation")');
  });
});
