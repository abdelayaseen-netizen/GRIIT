import React from "react";
import ChallengeDoneScreen from "../ChallengeDoneScreen";
import type { DayOpenModel } from "@/lib/day-open";

type Props = {
  model: DayOpenModel;
  proofUri?: string | null;
  shareFailed?: boolean;
  sharing?: boolean;
  onOpenTask: (id: string) => void;
  onNext: () => void;
  onDone: () => void;
  onShare?: () => void;
  onKeep?: () => void;
};

export function ChallengeDoneStep({
  model,
  proofUri,
  shareFailed,
  sharing,
  onOpenTask,
  onNext,
  onDone,
  onShare,
  onKeep,
}: Props) {
  return (
    <ChallengeDoneScreen
      model={model}
      proofUri={proofUri}
      shareFailed={shareFailed}
      sharing={sharing}
      onOpenTask={onOpenTask}
      onNext={onNext}
      onDone={onDone}
      onShare={onShare}
      onKeep={onKeep}
    />
  );
}
