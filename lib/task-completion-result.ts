/**
 * Confirmation variant + challenge-day snapshot for task completion v2.
 * Server-authored fields only — never invent streak or day-secured client-side.
 */

import { challengeWord } from "@/lib/format-days";

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

export function challengeDoneTitle(challengeTitle: string): string {
  return `${challengeTitle} done.`;
}

export function challengeDoneLine(remainingChallenges: number): string {
  const n = Math.max(0, Math.floor(remainingChallenges));
  return `${n} ${challengeWord(n)} left today.`;
}

export function pickConfirmationCopy(args: {
  daySecured: boolean;
  daySecuredEarlier: boolean;
  requiredRemaining: number;
  optional?: boolean;
}): { headline: string; footnote: string } {
  if (args.optional) {
    return {
      headline: "Task done",
      footnote: "This task is optional. It does not move the streak.",
    };
  }
  if (args.daySecuredEarlier) {
    return {
      headline: "Task done",
      footnote: "The day was already secured earlier today. Nothing changes on the streak.",
    };
  }
  if (!args.daySecured) {
    const n = args.requiredRemaining;
    return {
      headline: `${n} required task${n === 1 ? "" : "s"} left`,
      footnote: "The streak moves only when every required task for the day is done.",
    };
  }
  return {
    headline: "Day secured",
    footnote: "Streak: consecutive days where every required task was completed.",
  };
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
  secure?: {
    success: boolean;
    alreadySecured?: boolean;
    newStreakCount?: number;
    secured?: boolean;
    challenge_done?: boolean;
    remaining_challenges?: number;
  } | null;
}): SubmitResult {
  const alreadyFromSecure = args.secure?.alreadySecured === true;
  const rpcSecured = args.secure?.secured === true;
  const daySecuredEarlier = rpcSecured && (args.dayAlreadySecured || alreadyFromSecure);
  const justSecured = rpcSecured && !daySecuredEarlier;
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
