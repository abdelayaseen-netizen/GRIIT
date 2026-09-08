import React, { useEffect } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { track, trackEvent } from "@/lib/analytics";
import { maybePromptForReview } from "@/lib/review-prompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MomentScreenV3 from "@/components/task-v2/MomentScreenV3";

function ChallengeCompleteScreenInner() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const challengeIdParam =
    typeof params.challengeId === "string" ? params.challengeId : undefined;
  const challengeName = (params.challengeName as string) ?? "Challenge";
  const totalDays = parseInt((params.totalDays as string) ?? "0", 10);
  const totalDaysSecured = parseInt((params.totalDaysSecured as string) ?? "0", 10);

  useEffect(() => {
    track({
      name: "challenge_completed",
      challenge_name: challengeName,
      duration: totalDays,
    });
    trackEvent("challenge_completed", { challenge_id: challengeIdParam, days: totalDays });
  }, [challengeName, totalDays, challengeIdParam]);

  useEffect(() => {
    if (totalDaysSecured > 0) {
      maybePromptForReview(totalDaysSecured, "challenge_completed").catch(() => {});
    }
  }, [totalDaysSecured]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MomentScreenV3
        variant="complete"
        streak={totalDays}
        target={totalDays || 30}
        proofs={[]}
        onNext={() => router.replace(ROUTES.TABS_DISCOVER as never)}
        onDone={() => router.replace(ROUTES.TABS_HOME as never)}
      />
    </>
  );
}

export default function ChallengeCompleteScreen() {
  return (
    <ErrorBoundary>
      <ChallengeCompleteScreenInner />
    </ErrorBoundary>
  );
}
