/**
 * Confirmation wrapper — maps A–D onto MomentScreenV3.
 * SubmitResult and handlers stay owned by TaskFlowV2.
 */
import React from "react";
import type { SubmitResult } from "@/lib/task-completion-result";
import MomentScreenV3, { momentVariantFromResult, weekFromToday } from "./MomentScreenV3";

export function TaskConfirmation({
  result,
  proofUri,
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
  onDone: () => void;
  onShare?: (uri: string) => void;
  onNext?: () => void;
}) {
  // TODO(product): completion trigger
  const variant = momentVariantFromResult(result);
  const week = weekFromToday();
  return (
    <MomentScreenV3
      variant={variant}
      streak={result.streakDays}
      streakBefore={result.streakDaysBefore}
      day={result.challengeDay}
      remaining={result.requiredRemaining}
      target={result.challengeLength}
      proofUri={proofUri}
      week={week.days}
      todayIndex={week.todayIndex}
      onDone={onDone}
      onShare={onShare}
      onNext={onNext ?? onDone}
    />
  );
}
