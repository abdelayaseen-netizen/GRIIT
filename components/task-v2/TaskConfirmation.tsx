/**
 * Confirmation wrapper — maps A–D onto MomentScreenV3.
 * SubmitResult and handlers stay owned by TaskFlowV2.
 * Day, streak, and week come from today_state; proof card only if a photo exists.
 */
import React from "react";
import type { SubmitResult } from "@/lib/task-completion-result";
import MomentScreenV3, { momentVariantFromResult } from "./MomentScreenV3";
import { useToday } from "@/hooks/useToday";
import { displayDay } from "@/lib/challenge-day";
import { weekStrip } from "@/lib/today-derive";
import { EMPTY_TODAY } from "@/lib/today-state";

export function TaskConfirmation({
  result,
  activeChallengeId,
  proofUri,
  onDone,
  onShare,
  onNext,
}: {
  result: SubmitResult;
  activeChallengeId?: string;
  taskName: string;
  verifyLine: string;
  honest: boolean;
  optional?: boolean;
  proofUri?: string;
  onDone: () => void;
  onShare?: (uri: string) => void;
  onNext?: () => void;
}) {
  const todayQuery = useToday();
  const todayState = todayQuery.data ?? EMPTY_TODAY;
  const enrollment = todayState.enrollments.find((e) => e.active_challenge_id === activeChallengeId);
  const day = enrollment
    ? displayDay(enrollment.current_day, enrollment.secured_today)
    : result.challengeDay;
  const week = weekStrip(todayState);
  const streak = todayState.streak || result.streakDays;
  const variant = momentVariantFromResult(result);
  return (
    <MomentScreenV3
      variant={variant}
      streak={streak}
      streakBefore={result.streakDaysBefore}
      day={day}
      remaining={todayState.remaining_challenges || result.requiredRemaining}
      target={result.challengeLength}
      proofUri={proofUri}
      week={week.secured}
      todayIndex={week.todayIndex}
      onDone={onDone}
      onShare={onShare}
      onNext={onNext ?? onDone}
    />
  );
}
