import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChallengeEnd } from "@/components/challenge/ChallengeEnd";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import {
  endedChallengeFromUnseen,
  formatEndedDate,
  MARK_END_SEEN_FAILED,
  runMarkEndSeenOnDone,
  type UnseenEndingRow,
} from "@/lib/challenge-end";
import { FREE_ACTIVE_CHALLENGES_LIMIT, countActiveEnrollments } from "@/lib/free-challenge-limit";
import { resolveHomeTimeZone } from "@/lib/home-streak";
import { getTodayDateKey } from "@/lib/date-utils";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_V3 } from "@/lib/design-system";

function ChallengeEndScreenInner() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useApp();
  const bootstrap = useHomeBootstrap(user?.id);
  const timeZone = resolveHomeTimeZone(profile?.timezone, getDeviceIanaTimeZone());

  const unseenQuery = useQuery({
    queryKey: ["challenges", "listUnseenEndings", user?.id ?? ""],
    queryFn: () => trpcQuery<UnseenEndingRow[]>(TRPC.challenges.listUnseenEndings),
    enabled: !!user?.id,
  });
  const recordQuery = useQuery({
    queryKey: ["profiles", "getRecord", user?.id ?? ""],
    queryFn: () =>
      trpcQuery<{ proofs: { dateKey: string; imageUrl?: string | null }[] }>(TRPC.profiles.getRecord),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });
  if (unseenQuery.isError) captureError(unseenQuery.error, "ChallengeEnd.listUnseenEndings");

  const stats = bootstrap.data?.stats;
  const cameraKeys = [
    ...((recordQuery.data?.proofs ?? [])
      .filter((p) => !!p.imageUrl)
      .map((p) => p.dateKey)),
    ...(bootstrap.data?.todayCheckinsForUser ?? [])
      .filter((c) => !!(c.proof_url || c.completion_image_url))
      .map((c) => c.date_key)
      .filter((k): k is string => !!k),
  ];

  const challenges = (unseenQuery.data ?? []).map((row) =>
    endedChallengeFromUnseen(row, {
      timeZone,
      todayKey: getTodayDateKey(timeZone),
      securedDateKeys: Array.isArray(bootstrap.data?.securedDateKeys)
        ? bootstrap.data.securedDateKeys
        : [],
      frozenDateKeys: stats?.frozenDateKeys,
      lastStandDateKeys: stats?.lastStandDateKeys,
      cameraDateKeys: cameraKeys,
    }),
  );

  const activeCount = countActiveEnrollments(
    (Array.isArray(bootstrap.data?.activeChallenges) ? bootstrap.data.activeChallenges : []) as {
      status?: string;
    }[],
  );
  const sub = profile?.subscription_status;
  const isPro = sub === "premium" || sub === "trial" || bootstrap.data?.freezeStatus?.isPro === true;
  const challengeLimit = isPro ? null : FREE_ACTIVE_CHALLENGES_LIMIT;

  const [saveError, setSaveError] = useState<string | null>(null);

  const goHome = useCallback(() => {
    router.replace(ROUTES.HOME as never);
  }, [router]);

  const onDone = useCallback(async () => {
    await runMarkEndSeenOnDone({
      enrollmentIds: challenges.map((c) => c.id),
      markSeen: async (ids) => {
        try {
          await trpcMutate(TRPC.challenges.markEndSeen, { enrollmentIds: ids });
        } catch (e) {
          captureError(e, "ChallengeEnd.markEndSeen");
          throw e;
        }
      },
      goHome,
      onFail: (message) => setSaveError(message || MARK_END_SEEN_FAILED),
    });
  }, [challenges, goHome]);

  useEffect(() => {
    if (!unseenQuery.isLoading && (unseenQuery.data?.length ?? 0) === 0) {
      goHome();
    }
  }, [unseenQuery.isLoading, unseenQuery.data, goHome]);

  if (unseenQuery.isLoading && challenges.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={DS_V3.color.brand} />
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={DS_V3.color.brand} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChallengeEnd
        challenges={challenges}
        activeCount={activeCount}
        challengeLimit={challengeLimit}
        formatDate={(iso) => formatEndedDate(iso, timeZone)}
        saveError={saveError}
        onClose={goHome}
        onDone={() => void onDone()}
        onRestart={(challengeId) => router.replace(ROUTES.CHALLENGE_ID(challengeId) as never)}
      />
    </>
  );
}

export default function ChallengeEndScreen() {
  return (
    <ErrorBoundary>
      <ChallengeEndScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
});
