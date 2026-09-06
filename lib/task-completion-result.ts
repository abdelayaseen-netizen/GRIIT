/**
 * Confirmation variant + challenge-day snapshot for task completion v2.
 * Server-authored fields only — never invent streak or day-secured client-side.
 */

export type VerificationKind = "live_photo" | "timer" | "gps" | "word_count" | "self_report";

export type SubmitResult = {
  taskComplete: true;
  daySecured: boolean;
  daySecuredEarlier: boolean;
  requiredRemaining: number;
  streakDays: number;
  streakDaysBefore: number;
  challengeDay: number;
  challengeLength: number;
  challengeName: string;
  verificationKind: VerificationKind;
};

export type ConfirmationVariant = "A" | "B" | "C" | "D";

/** Always the pre-secure snapshot. secureDay increments current_day. */
export function pickConfirmationChallengeDay(args: {
  dayFromComplete: number;
  dayFromSecureAfter: number;
}): number {
  return args.dayFromComplete;
}

export function pickConfirmationVariant(result: {
  verificationKind: VerificationKind;
  daySecured: boolean;
  daySecuredEarlier: boolean;
}): ConfirmationVariant {
  if (result.verificationKind === "self_report") return "D";
  if (result.daySecuredEarlier) return "C";
  if (result.daySecured) return "A";
  return "B";
}

export function assembleSubmitResult(args: {
  verificationKind: VerificationKind;
  requiredRemaining: number;
  dayAlreadySecured: boolean;
  streakDaysBefore: number;
  challengeDayBeforeSecure: number;
  challengeLength: number;
  challengeName: string;
  secure?: { success: boolean; alreadySecured?: boolean; newStreakCount?: number } | null;
}): SubmitResult {
  const alreadyFromSecure = args.secure?.alreadySecured === true;
  const daySecuredEarlier = args.dayAlreadySecured || alreadyFromSecure;
  const justSecured = args.secure?.success === true && !alreadyFromSecure && !args.dayAlreadySecured;
  const daySecured = daySecuredEarlier || justSecured;
  return {
    taskComplete: true,
    daySecured,
    daySecuredEarlier,
    requiredRemaining: args.requiredRemaining,
    streakDays: args.secure?.newStreakCount ?? args.streakDaysBefore,
    streakDaysBefore: args.streakDaysBefore,
    challengeDay: pickConfirmationChallengeDay({
      dayFromComplete: args.challengeDayBeforeSecure,
      dayFromSecureAfter: args.challengeDayBeforeSecure + 1,
    }),
    challengeLength: args.challengeLength,
    challengeName: args.challengeName,
    verificationKind: args.verificationKind,
  };
}
