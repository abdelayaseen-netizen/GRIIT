import type { QueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/routes";
import { getTodayDateKey } from "@/lib/date-utils";
import type { SubmitResult, VerificationKind } from "@/lib/task-completion-result";

export function readSecuredDateKeysFromCache(queryClient: QueryClient, userId: string): string[] {
  const dedicated = queryClient.getQueryData<string[]>(["profiles", "getSecuredDateKeys", userId]);
  if (Array.isArray(dedicated)) return dedicated;
  const home = queryClient.getQueryData<{ securedDateKeys?: string[] | null }>([
    "home",
    "bootstrap",
    userId,
  ]);
  return Array.isArray(home?.securedDateKeys) ? home.securedDateKeys : [];
}

export function todayIsSecuredInCache(
  queryClient: QueryClient,
  userId: string,
  timezone?: string | null
): boolean {
  return readSecuredDateKeysFromCache(queryClient, userId).includes(getTodayDateKey(timezone));
}

export function taskSecuredHref(result: SubmitResult, proofUri?: string, taskName?: string) {
  return {
    pathname: ROUTES.TASK_SECURED,
    params: {
      daySecured: result.daySecured ? "1" : "0",
      daySecuredEarlier: result.daySecuredEarlier ? "1" : "0",
      requiredRemaining: String(result.requiredRemaining),
      streakDays: String(result.streakDays),
      streakDaysBefore: String(result.streakDaysBefore),
      challengeDay: String(result.challengeDay),
      challengeLength: String(result.challengeLength),
      challengeName: result.challengeName,
      verificationKind: result.verificationKind,
      proofUri: proofUri ?? "",
      taskName: taskName ?? "",
    },
  } as const;
}

const KINDS: VerificationKind[] = ["live_photo", "timer", "gps", "word_count", "self_report"];

export function submitResultFromSecuredParams(params: {
  daySecured?: string;
  daySecuredEarlier?: string;
  requiredRemaining?: string;
  streakDays?: string;
  streakDaysBefore?: string;
  challengeDay?: string;
  challengeLength?: string;
  challengeName?: string;
  verificationKind?: string;
}): SubmitResult {
  const kind = KINDS.includes(params.verificationKind as VerificationKind)
    ? (params.verificationKind as VerificationKind)
    : "self_report";
  return {
    taskComplete: true,
    daySecured: params.daySecured === "1",
    daySecuredEarlier: params.daySecuredEarlier === "1",
    requiredRemaining: parseInt(params.requiredRemaining ?? "0", 10) || 0,
    streakDays: parseInt(params.streakDays ?? "0", 10) || 0,
    streakDaysBefore: parseInt(params.streakDaysBefore ?? "0", 10) || 0,
    challengeDay: Math.max(1, parseInt(params.challengeDay ?? "1", 10) || 1),
    challengeLength: Math.max(1, parseInt(params.challengeLength ?? "1", 10) || 1),
    challengeName: params.challengeName ?? "",
    verificationKind: kind,
  };
}
