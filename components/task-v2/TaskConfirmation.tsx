/**
 * Confirmation wrapper — maps A–D onto MomentScreenV3.
 * SubmitResult and handlers stay owned by TaskFlowV2.
 */
import React from "react";
import type { SubmitResult } from "@/lib/task-completion-result";
import MomentScreenV3, { momentVariantFromResult, weekFromToday } from "./MomentScreenV3";
import type { WeekStripDay } from "@/components/ds/WeekStrip";

export function TaskConfirmation({
  result,
  proofUri,
  week,
  todayIndex,
  fillToday,
  onDone,
  onShare,
  onNext,
}: {
  result: SubmitResult;
  taskName: string;
  verifyLine: string;
  honest: boolean;
  optional?: boolean;
  proofUri?: string;
  week?: WeekStripDay[];
  todayIndex?: number;
  fillToday?: boolean;
  onDone: () => void;
  onShare?: (uri: string) => void;
  onNext?: () => void;
}) {
  // TODO(product): completion trigger
  const variant = momentVariantFromResult(result);
  const fallback = weekFromToday();
  return (
    <MomentScreenV3
      variant={variant}
      streak={result.streakDays}
      streakBefore={result.streakDaysBefore}
      day={result.challengeDay}
      remaining={result.requiredRemaining}
      target={result.challengeLength}
      proofUri={proofUri}
      week={week ?? fallback.days}
      todayIndex={todayIndex ?? fallback.todayIndex}
      fillToday={fillToday ?? result.daySecured}
      onDone={onDone}
      onShare={onShare}
      onNext={onNext ?? onDone}
    />
  );
}
