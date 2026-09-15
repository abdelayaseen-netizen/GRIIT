import React from "react";
import ChallengeDoneScreen from "../ChallengeDoneScreen";

type Props = {
  challengeTitle: string;
  remainingChallenges: number;
  onNext: () => void;
  onDone: () => void;
};

export function ChallengeDoneStep({ challengeTitle, remainingChallenges, onNext, onDone }: Props) {
  return (
    <ChallengeDoneScreen
      challengeTitle={challengeTitle}
      remainingChallenges={remainingChallenges}
      onNext={onNext}
      onDone={onDone}
    />
  );
}
