import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { track, trackEvent } from "@/lib/analytics";
import { maybePromptForReview } from "@/lib/review-prompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import MomentScreenV3 from "@/components/task-v2/MomentScreenV3";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

type FinishRecord = {
  challengeName: string;
  durationDays: number;
  securedDays: number;
  longestStreak: number;
  heldDays: number;
  daysDone: number;
};

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

function ChallengeCompleteScreenInner() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const challengeIdParam = firstParam(params.challengeId);
  const enrollmentId = firstParam(params.enrollmentId);
  const challengeName = firstParam(params.challengeName) || "Challenge";
  const totalDays = parseInt(firstParam(params.totalDays) || "0", 10);
  const [record, setRecord] = useState<FinishRecord | null>(null);

  useEffect(() => {
    track({
      name: "challenge_completed",
      challenge_name: challengeName,
      duration: totalDays,
    });
    trackEvent("challenge_completed", { challenge_id: challengeIdParam || undefined, days: totalDays });
  }, [challengeName, totalDays, challengeIdParam]);

  useEffect(() => {
    if (!enrollmentId) return;
    let live = true;
    void trpcQuery<FinishRecord>(TRPC.challenges.finishRecord, { enrollmentId }).then((row) => {
      if (!live || !row) return;
      setRecord(row);
      if (row.securedDays > 0) {
        maybePromptForReview(row.securedDays, "challenge_completed").catch(() => {});
      }
    }).catch(() => {});
    return () => {
      live = false;
    };
  }, [enrollmentId]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MomentScreenV3
        variant="complete"
        challengeName={record?.challengeName || challengeName}
        streak={record?.longestStreak ?? 0}
        securedDays={record?.securedDays ?? 0}
        longestStreak={record?.longestStreak ?? 0}
        heldDays={record?.heldDays ?? 0}
        numbersReady={record != null}
        target={record?.durationDays || totalDays || 30}
        onDone={() => router.replace(ROUTES.TABS_HOME as never)}
      />
    </>
  );
}

export default function ChallengeCompleteScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <ChallengeCompleteScreenInner />
      </ErrorBoundary>
    </Screen>
  );
}
