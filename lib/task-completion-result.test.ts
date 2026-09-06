import { describe, expect, it } from "vitest";
import {
  assembleSubmitResult,
  pickConfirmationChallengeDay,
  pickConfirmationVariant,
} from "@/lib/task-completion-result";

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
      secure: { success: true, alreadySecured: false, newStreakCount: 14 },
    });
    expect(result.challengeDay).toBe(3);
    expect(result.daySecured).toBe(true);
    expect(result.daySecuredEarlier).toBe(false);
    expect(result.streakDays).toBe(14);
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
      secure: { success: true, alreadySecured: true, newStreakCount: 14 },
    });
    expect(result.daySecuredEarlier).toBe(true);
    expect(pickConfirmationVariant(result)).toBe("C");
  });
});
