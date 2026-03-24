import React from "react";
import ProofShareCard from "@/components/ProofShareCard";
import { useProofSharePromptStore } from "@/store/proofSharePromptStore";

/** Milestone secure-day share prompt (driven from AppContext after checkins.secureDay). */
export default function ProofShareOverlay() {
  const payload = useProofSharePromptStore((s) => s.payload);
  const dismiss = useProofSharePromptStore((s) => s.dismiss);
  if (!payload) return null;
  return (
    <ProofShareCard
      userName={payload.userName}
      challengeTitle={payload.challengeTitle}
      dayNumber={payload.dayNumber}
      totalDays={payload.totalDays}
      streakCount={payload.streakCount}
      proofPhotoUri={payload.proofPhotoUri}
      onDismiss={dismiss}
      onShared={() => {
        if (__DEV__) console.log("[ProofShare] User shared milestone card");
      }}
    />
  );
}
