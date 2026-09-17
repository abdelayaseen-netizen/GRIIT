import React from "react";
import ChallengeDoneScreen from "../ChallengeDoneScreen";
import type { DayOpenModel } from "@/lib/day-open";

type Props = {
  model: DayOpenModel;
  onOpenTask: (id: string) => void;
  onNext: () => void;
  onDone: () => void;
};

export function ChallengeDoneStep({ model, onOpenTask, onNext, onDone }: Props) {
  return (
    <ChallengeDoneScreen model={model} onOpenTask={onOpenTask} onNext={onNext} onDone={onDone} />
  );
}
