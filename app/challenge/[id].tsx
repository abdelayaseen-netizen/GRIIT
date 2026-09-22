import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionSheetIOS, Alert, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, usePathname, useRouter, Stack } from "expo-router";
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
import { supabase } from "@/lib/supabase";
import { dateKeyFromIso } from "@/lib/home-day-total";
import { resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import {
  countSecuredInRange,
  finishedHeaderLine,
  pickLatestEndedEnrollment,
  type EndedEnrollmentRow,
} from "@/lib/profile-challenges";
import { FREE_ACTIVE_CHALLENGES_LIMIT, FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";
import { classifyJoinChallengeError } from "@/lib/join-challenge-error";
import { ensureAnonymousSession } from "@/lib/anon-auth";
import { track, trackEvent } from "@/lib/analytics";
import { formatTRPCError } from "@/lib/api";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { setPendingChallengeId } from "@/lib/onboarding-pending";
import { DS_V3 } from "@/lib/design-system";
import {
  GROUP_CAP,
  afterAcceptActiveId,
  detailFooterVariant,
} from "@/lib/group-ui";
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
  creator_id?: string | null;
  memberCount?: number | null;
  cap?: number | null;
  viewerInviteStatus?: string | null;
  teamMembers?: {
    user_id: string;
    role?: string | null;
    profiles?: { display_name?: string | null; username?: string | null } | null;
  }[];
  tasks?: DetailTask[];
  challenge_tasks?: DetailTask[];
};

export default function ChallengeDetailScreen() {
  const rawParams = useLocalSearchParams();
  const params = (rawParams ?? {}) as Record<string, string | string[] | undefined>;
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const ref = typeof params.ref === "string" ? params.ref : Array.isArray(params.ref) ? params.ref[0] : undefined;
  const inviteIdParam =
    typeof params.inviteId === "string"
      ? params.inviteId
      : Array.isArray(params.inviteId)
        ? params.inviteId[0]
        : undefined;
  const inviterParam =
    typeof params.inviter === "string"
      ? params.inviter
      : Array.isArray(params.inviter)
        ? params.inviter[0]
        : undefined;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeChallenge, refetchAll, profile } = useApp();
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

  const endedEnrollmentQuery = useQuery({
    queryKey: ["challenge", "endedEnrollment", user?.id ?? "", id],
    enabled: !!user && !!id && enrollmentsReady && !activeChallengeId,
    queryFn: async (): Promise<EndedEnrollmentRow | null> => {
      const { data, error: qErr } = await supabase
        .from("active_challenges")
        .select("id, challenge_id, status, start_at, end_at, ended_at, current_day")
        .eq("user_id", user!.id)
        .eq("challenge_id", id!)
        .in("status", ["completed", "failed"])
        .order("ended_at", { ascending: false })
        .limit(1);
      if (qErr) throw qErr;
      return pickLatestEndedEnrollment((data ?? []) as EndedEnrollmentRow[]);
    },
  });

  const securedKeysQuery = useQuery({
    queryKey: ["profiles", "getSecuredDateKeys", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
    enabled: !!user && !!endedEnrollmentQuery.data,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!activeChallengeId) return;
    if (pathname.includes("/members") || pathname.includes("/invite")) return;
    router.replace(ROUTES.CHALLENGE_ACTIVE(activeChallengeId) as never);
  }, [activeChallengeId, router, pathname]);

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
  const footerVariant = detailFooterVariant({
    viewerInviteStatus: challenge?.viewerInviteStatus,
    participationType,
    state,
  });
  const creatorName = (() => {
    const members = challenge?.teamMembers ?? [];
    const creator = members.find((m) => m.role === "creator") ?? members[0];
    const name = creator?.profiles?.display_name?.trim() || creator?.profiles?.username?.trim();
    return name || "Someone";
  })();
  const invite =
    footerVariant === "invited"
      ? {
          inviterName: inviterParam?.trim() || creatorName,
          memberCount:
            typeof challenge?.memberCount === "number"
              ? challenge.memberCount
              : typeof challenge?.participants_count === "number"
                ? challenge.participants_count
                : 0,
          cap: typeof challenge?.cap === "number" ? challenge.cap : GROUP_CAP,
        }
      : undefined;
  const description = (challenge?.description ?? "").trim();
  const durationDays = challenge?.duration_days && challenge.duration_days > 0 ? challenge.duration_days : 1;
  const timeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );
  const ended = endedEnrollmentQuery.data ?? null;
  const endedPending =
    !!user &&
    enrollmentsReady &&
    !activeChallengeId &&
    endedEnrollmentQuery.isLoading &&
    endedEnrollmentQuery.data === undefined;
  const finished = !activeChallengeId && ended != null;
  const startKey = ended?.start_at ? dateKeyFromIso(ended.start_at, timeZone) : "";
  const endIso = ended?.ended_at ?? ended?.end_at ?? "";
  const endKey = endIso ? dateKeyFromIso(endIso, timeZone) : "";
  const securedDays =
    startKey && endKey && (securedKeysQuery.data?.length ?? 0) > 0
      ? countSecuredInRange(securedKeysQuery.data ?? [], startKey, endKey)
      : Math.min(ended?.current_day ?? 0, durationDays);
  const endedOnDay = ended?.current_day ?? durationDays;
  const finishedLine = finished
    ? finishedHeaderLine({
        status: ended.status === "failed" ? "failed" : "completed",
        secured_days: securedDays,
        duration_days: durationDays,
        current_day: endedOnDay,
        ended_on_day: endedOnDay,
      })
    : undefined;
  const catalogLoading =
    (challengeQuery.isLoading && !challenge) || !enrollmentsReady || !!activeChallengeId || endedPending;
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
      void queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      void myActiveListQuery.refetch();
      if (result?.id) {
        router.replace(ROUTES.CHALLENGE_ACTIVE(result.id) as never);
      }
    } catch (err: unknown) {
      captureError(err, { flow: "challenge_join", challengeId: id });
      const classified = classifyJoinChallengeError(err);
      if (classified.kind === "limit") {
        showError(FREE_ACTIVE_LIMIT_MESSAGE);
        goPaywall();
        return;
      }
      if (classified.kind === "already") {
        showError(classified.message);
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

  const resolveInviteId = useCallback(async (): Promise<string | null> => {
    if (inviteIdParam) return inviteIdParam;
    if (!id) return null;
    const opened = (await trpcMutate(TRPC.groups.openLink, { challengeId: id })) as {
      invite?: { id?: string };
    };
    return typeof opened.invite?.id === "string" && opened.invite.id.length > 0 ? opened.invite.id : null;
  }, [id, inviteIdParam]);

  const onAccept = useCallback(async () => {
    if (!id || joining) return;
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoining(true);
    try {
      const inviteId = await resolveInviteId();
      if (!inviteId) {
        showError("This invite is no longer pending.");
        return;
      }
      const result = (await trpcMutate(TRPC.groups.respond, {
        inviteId,
        action: "accept",
      })) as { id?: string; status?: string };
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE, "true");
      void registerPushTokenWithBackend().catch(() => {
        /* non-fatal */
      });
      void refetchAll().catch((e: unknown) => {
        captureError(e, "ChallengeDetailRefetchAfterAccept");
      });
      void queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      const refreshed = await myActiveListQuery.refetch();
      const list = Array.isArray(refreshed.data) ? (refreshed.data as { challenge_id?: string; id?: string }[]) : [];
      const activeId = afterAcceptActiveId(result, list, id);
      if (activeId) {
        router.replace(ROUTES.CHALLENGE_ACTIVE(activeId) as never);
      }
    } catch (err: unknown) {
      captureError(err, { flow: "group_accept", challengeId: id });
      const formatted = formatTRPCError(err);
      showError(
        typeof formatted.message === "string" && formatted.message.trim()
          ? `${formatted.title}: ${formatted.message}`
          : formatted.title,
      );
    } finally {
      setJoining(false);
    }
  }, [id, joining, resolveInviteId, showError, refetchAll, queryClient, user?.id, myActiveListQuery, router]);

  const onNotNow = useCallback(() => {
    goBack();
  }, [goBack]);

  const onDecline = useCallback(async () => {
    if (!id) return;
    try {
      const inviteId = await resolveInviteId();
      if (!inviteId) return;
      await trpcMutate(TRPC.groups.respond, { inviteId, action: "decline" });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      void queryClient.invalidateQueries({ queryKey: ["activity", "notifications", user?.id] });
      goBack();
    } catch (err: unknown) {
      captureError(err, { flow: "group_decline", challengeId: id });
      const formatted = formatTRPCError(err);
      showError(
        typeof formatted.message === "string" && formatted.message.trim()
          ? `${formatted.title}: ${formatted.message}`
          : formatted.title,
      );
    }
  }, [id, resolveInviteId, queryClient, user?.id, goBack, showError]);

  const onMore = useCallback(() => {
    if (challenge?.viewerInviteStatus !== "pending") return;
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Decline invite", "Cancel"], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
        (i) => {
          if (i === 0) void onDecline();
        },
      );
      return;
    }
    Alert.alert("Invite", undefined, [
      { text: "Decline invite", style: "destructive", onPress: () => void onDecline() },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [challenge?.viewerInviteStatus, onDecline]);

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

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        {error ? <InlineError message={error} onDismiss={clearError} /> : null}
        <ChallengeDetailV3
          title={challenge?.title?.trim() || "Challenge"}
          description={description || undefined}
          durationDays={durationDays}
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
          loading={catalogLoading}
          error={
            !catalogLoading &&
            (challengeQuery.isError || (!challengeQuery.isLoading && !challenge))
          }
          invite={finished ? undefined : invite}
          finishedLine={catalogLoading ? undefined : finishedLine}
          onBack={goBack}
          onMore={footerVariant === "invited" && !finished ? onMore : undefined}
          onJoin={finished ? undefined : () => void onJoin()}
          onStartAgain={finished ? () => void onJoin() : undefined}
          onAccept={() => void onAccept()}
          onNotNow={onNotNow}
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
