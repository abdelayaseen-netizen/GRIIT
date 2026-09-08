import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";
import { FREE_ACTIVE_CHALLENGES_LIMIT, FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";
import { ensureAnonymousSession } from "@/lib/anon-auth";
import { track, trackEvent } from "@/lib/analytics";
import { formatTRPCError } from "@/lib/api";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { setPendingChallengeId } from "@/lib/onboarding-pending";
import { DS_V3 } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import ChallengeDetailV3 from "@/components/challenge/ChallengeDetailV3";
import {
  detailState,
  formatChallengeDate,
  mapParticipationType,
  toDetailTasks,
  type DetailTask,
} from "@/lib/challenge-detail-mapping";

type JoinResult = { id?: string };

type ChallengeRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  duration_days?: number | null;
  duration_type?: string | null;
  ends_at?: string | null;
  live_date?: string | null;
  status?: string | null;
  run_status?: string | null;
  participation_type?: string | null;
  participants_count?: number | null;
  is_hard_mode?: boolean | null;
  tasks?: DetailTask[];
  challenge_tasks?: DetailTask[];
};

export default function ChallengeDetailScreen() {
  const rawParams = useLocalSearchParams();
  const params = (rawParams ?? {}) as Record<string, string | string[] | undefined>;
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const ref = typeof params.ref === "string" ? params.ref : Array.isArray(params.ref) ? params.ref[0] : undefined;
  const router = useRouter();
  const { user } = useAuth();
  const { activeChallenge, refetchAll } = useApp();
  const { isPro } = useProStatus();
  const queryClient = useQueryClient();
  const { error, showError, clearError } = useInlineError();
  const [joining, setJoining] = useState(false);

  const myActiveListQuery = useQuery({
    queryKey: ["challenge", "listMyActive", id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    enabled: !!user && !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const activeChallengeId = useMemo(() => {
    if (id && activeChallenge?.challenge_id === id) return activeChallenge.id;
    const list = myActiveListQuery.data;
    if (!id || !Array.isArray(list)) return undefined;
    const match = list.find((r) => (r as { challenge_id?: string }).challenge_id === id) as
      | { id?: string }
      | undefined;
    return match?.id;
  }, [id, activeChallenge?.challenge_id, activeChallenge?.id, myActiveListQuery.data]);

  const enrollmentsReady =
    !user ||
    myActiveListQuery.isFetched ||
    myActiveListQuery.isError ||
    !!(id && activeChallenge?.challenge_id === id);

  useEffect(() => {
    if (!activeChallengeId) return;
    router.replace(ROUTES.CHALLENGE_ACTIVE(activeChallengeId) as never);
  }, [activeChallengeId, router]);

  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery(TRPC.challenges.getById, { id: id! }) as Promise<ChallengeRow>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const sourceParam =
    typeof params.source === "string"
      ? params.source
      : Array.isArray(params.source)
        ? params.source[0]
        : undefined;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const source: "discover" | "home" | "deeplink" =
        sourceParam === "home" || sourceParam === "discover" || sourceParam === "deeplink"
          ? sourceParam
          : ref
            ? "deeplink"
            : "discover";
      trackEvent("challenge_viewed", { challenge_id: id, source });
    }, [id, ref, sourceParam]),
  );

  useEffect(() => {
    if (!ref || !user?.id || !id) return;
    trpcMutate(TRPC.referrals.recordOpen, { referrerUserId: ref, challengeId: id }).catch((e) => {
      captureError(e, "ChallengeDetailRecordOpen");
    });
  }, [ref, user?.id, id]);

  const challenge = challengeQuery.data ?? null;
  const myActiveCount = Array.isArray(myActiveListQuery.data) ? myActiveListQuery.data.length : 0;
  const tasksRaw = (challenge?.tasks ?? challenge?.challenge_tasks ?? []) as DetailTask[];
  const tasks = toDetailTasks(tasksRaw);
  const participationType = mapParticipationType(challenge?.participation_type);
  const state = detailState(
    {
      ends_at: challenge?.ends_at,
      live_date: challenge?.live_date,
      duration_type: challenge?.duration_type,
      status: challenge?.status,
      run_status: challenge?.run_status,
    },
    isPro ? 0 : myActiveCount,
    FREE_ACTIVE_CHALLENGES_LIMIT,
  );
  const description = (challenge?.description ?? "").trim();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const goPaywall = useCallback(() => {
    router.push(ROUTES.PAYWALL as never);
  }, [router]);

  const onJoin = useCallback(async () => {
    if (!id || joining) return;
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!user) {
      const anon = await ensureAnonymousSession();
      if (anon.kind !== "ok") {
        showError(anon.message ?? "Could not start a guest session.");
        return;
      }
      await setPendingChallengeId(id);
    }
    setJoining(true);
    try {
      const result = (await trpcMutate(TRPC.challenges.join, { challengeId: id })) as JoinResult;
      void trpcMutate(TRPC.referrals.markJoinedChallenge, { challengeId: id }).catch((refErr: unknown) => {
        captureError(refErr, "ChallengeDetailMarkJoinedChallenge");
      });
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE, "true");
      void registerPushTokenWithBackend().catch(() => {
        /* non-fatal */
      });
      trackEvent("challenge_joined", { challenge_id: id });
      try {
        track({ name: "challenge_joined", challenge_id: id });
      } catch {
        /* non-fatal */
      }
      void refetchAll().catch((e: unknown) => {
        captureError(e, "ChallengeDetailRefetchAfterJoin");
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      void myActiveListQuery.refetch();
      if (result?.id) {
        router.replace(ROUTES.CHALLENGE_ACTIVE(result.id) as never);
      }
    } catch (err: unknown) {
      captureError(err, { flow: "challenge_join", challengeId: id });
      const msg = err instanceof Error ? err.message : "";
      const code = (err as { data?: { code?: string } })?.data?.code;
      if (
        code === "FORBIDDEN" ||
        msg.includes(FREE_ACTIVE_LIMIT_MESSAGE) ||
        msg.toLowerCase().includes("up to 3 challenges")
      ) {
        showError(FREE_ACTIVE_LIMIT_MESSAGE);
        goPaywall();
        return;
      }
      const formatted = formatTRPCError(err);
      showError(
        typeof formatted.message === "string" && formatted.message.trim()
          ? `${formatted.title}: ${formatted.message}`
          : formatted.title,
      );
    } finally {
      setJoining(false);
    }
  }, [id, joining, user, showError, refetchAll, queryClient, myActiveListQuery, router, goPaywall]);

  if (!id) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ChallengeDetailV3
          title="Challenge"
          durationDays={1}
          participationType="solo"
          participantsCount={0}
          tasks={[]}
          state="default"
          isHardMode={false}
          error
          onBack={goBack}
          onRetry={goBack}
        />
      </SafeAreaView>
    );
  }

  if (!enrollmentsReady || activeChallengeId) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        {error ? <InlineError message={error} onDismiss={clearError} /> : null}
        <ChallengeDetailV3
          title={challenge?.title?.trim() || "Challenge"}
          description={description || undefined}
          durationDays={challenge?.duration_days && challenge.duration_days > 0 ? challenge.duration_days : 1}
          participationType={participationType}
          participantsCount={
            typeof challenge?.participants_count === "number" ? challenge.participants_count : 0
          }
          tasks={tasks}
          state={state}
          isHardMode={challenge?.is_hard_mode === true}
          activeCount={myActiveCount}
          freeLimit={FREE_ACTIVE_CHALLENGES_LIMIT}
          endsOn={formatChallengeDate(challenge?.ends_at)}
          startsOn={formatChallengeDate(challenge?.live_date)}
          joining={joining}
          loading={challengeQuery.isLoading && !challenge}
          error={challengeQuery.isError || (!challengeQuery.isLoading && !challenge)}
          onBack={goBack}
          onJoin={() => void onJoin()}
          onUpgrade={goPaywall}
          onRetry={() => void challengeQuery.refetch()}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
});
