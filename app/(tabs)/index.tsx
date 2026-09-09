import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { fetchStatsWithReconcile } from "@/lib/fetch-stats-with-reconcile";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import type { StatsFromApi } from "@/types";
import LiveFeedSection from "@/components/LiveFeedSection";
import { HomeV3, greetingTitle } from "@/components/home/HomeV3";
import { resolveDisplayedStreak, resolveHomeStatsReady, resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { DS_V3 } from "@/lib/design-system";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useFeedToggle } from "@/store/feedToggleStore";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { displayDay } from "@/lib/challenge-day";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";
import { JeopardyModal } from "@/components/home/JeopardyModal";
import { nextProfileV2Badge } from "@/lib/profile-v2-badges";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { useToday } from "@/hooks/useToday";
import { badge, pickProofTask, proofCard, taskTypeFromToday, weekStrip, type TodayProofPick } from "@/lib/today-derive";
import { EMPTY_TODAY } from "@/lib/today-state";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

function minutesUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 60000);
}

type FollowCounts = { followers: number; following: number };

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile } = useApp();
  const [showFreezeModal, setShowFreezeModal] = React.useState(false);
  const [showJeopardyModal, setShowJeopardyModal] = React.useState(false);

  const feedScope = useFeedToggle((s) => s.scope);
  const setFeedScope = useFeedToggle((s) => s.setScope);
  const initFeedToggle = useFeedToggle((s) => s.initIfFirstRun);

  const freezeStatusQuery = useQuery({
    queryKey: ["streaks", "getFreezeStatus", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 120_000,
    queryFn: () =>
      trpcQuery(TRPC.streaks.getFreezeStatus) as Promise<{
        remaining: number;
        limit: number;
        isPro: boolean;
      }>,
  });

  const followCountsQuery = useQuery({
    queryKey: ["profiles", "getFollowCounts", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts) as Promise<FollowCounts>,
  });

  // Home-owned getStats: AppContext fetchStats swallows errors and never retries,
  // so a failed mount leaves stats null (and "0 days") forever. This query
  // refetches on focus / window focus / pull-to-refresh and exposes isSuccess
  // so a missing fetch is not rendered as a real zero.
  const statsQuery = useQuery({
    queryKey: ["profiles", "getStats", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<StatsFromApi> => {
      try {
        return await fetchStatsWithReconcile();
      } catch (err) {
        captureError(err, "HomeGetStats");
        throw err;
      }
    },
  });

  React.useEffect(() => {
    const followingCount = followCountsQuery.data?.following ?? 0;
    initFeedToggle(followingCount);
  }, [followCountsQuery.data?.following, initFeedToggle]);

  const todayQuery = useToday();
  const todayState = todayQuery.data ?? EMPTY_TODAY;
  const proofCounts = useMemo(() => badge(todayState), [todayState]);
  const week = useMemo(() => weekStrip(todayState), [todayState]);
  const minutesRemaining = minutesUntilMidnight();
  const tasksRemaining = Math.max(0, proofCounts.total - proofCounts.done);

  const resolvedStats = statsQuery.data ?? stats;
  const statsReady = resolveHomeStatsReady({
    queryFetched: statsQuery.isFetched,
    queryData: statsQuery.data,
    contextStats: stats,
  });
  const streak = resolveDisplayedStreak(statsReady, resolvedStats?.activeStreak);

  const homeTimeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );

  const homeState = useMemo(
    () =>
      computeHomeState({
        streak: streak ?? 0,
        tasksRemaining,
        minutesToMidnight: minutesRemaining,
      }),
    [streak, tasksRemaining, minutesRemaining],
  );

  const lastHomeStateFiredRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!FLAGS.PR3_HOME_STATE_ANALYTICS) return;
    if (streak == null) return;
    if (lastHomeStateFiredRef.current === homeState) return;
    lastHomeStateFiredRef.current = homeState;
    track({ name: "home_state_viewed", state: homeState, streak });
  }, [homeState, streak]);

  const showCelebration = useCelebrationStore((s) => s.show);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (!profile || streak == null || streak <= 0) return;
    const keys = [...todayState.secured_date_keys].sort();
    if (keys.length === 0) return;
    const lastKey = keys[keys.length - 1]!;
    const dateKey = getTodayDateKey(homeTimeZone);
    const yesterday = getYesterdayDateKey(homeTimeZone);
    const missedWindow = lastKey !== dateKey && lastKey !== yesterday;
    if (missedWindow) {
      setShowFreezeModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- profile identity covered via profile?.username
  }, [isGuest, user?.id, profile?.username, streak, todayState.secured_date_keys]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (streak == null) return;
    void scheduleStreakReminder(streak);
  }, [isGuest, user?.id, streak]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (homeState !== "streak_at_risk") return;
    const dateKey = getTodayDateKey(homeTimeZone);
    const storageKey = `griit_jeopardy_${dateKey}`;
    AsyncStorage.getItem(storageKey).then((shown) => {
      if (shown) return;
      void AsyncStorage.setItem(storageKey, "true");
      setShowJeopardyModal(true);
    }).catch(() => {
      setShowJeopardyModal(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- homeState covers all inputs
  }, [isGuest, user?.id, homeState]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      void statsQuery.refetch();
      void todayQuery.refetch();
    }, [isGuest, user?.id, statsQuery.refetch, todayQuery.refetch]),
  );

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      let cancelled = false;
      const run = async () => {
        const n = streak;
        if (n == null || !STREAK_MILESTONES.some((m) => m === n)) return;
        const key = `griit_milestone_${n}`;
        const shown = await AsyncStorage.getItem(key);
        if (cancelled || shown) return;
        await AsyncStorage.setItem(key, "true");
        showCelebration({
          title: `${n}-day streak!`,
          subtitle: "You're building something real.",
          type: "streak",
        });
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [isGuest, user?.id, streak, showCelebration]),
  );

  const refresh = useCallback(async () => {
    await Promise.all([todayQuery.refetch(), statsQuery.refetch(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [todayQuery, statsQuery, refetchAll, queryClient]);

  const onPressTask = useCallback(
    (pick: TodayProofPick) => {
      const { enrollment, task } = pick;
      const taskType = taskTypeFromToday(task);
      const taskConfig = buildTaskConfigParam({
        id: task.id,
        title: task.title,
        require_photo: task.require_photo,
        require_location: task.require_location,
        config: task.config ?? {},
      });
      router.push(
        `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}&activeChallengeId=${encodeURIComponent(enrollment.active_challenge_id)}&taskType=${encodeURIComponent(taskType)}&taskName=${encodeURIComponent(task.title)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(taskConfig)}&challengeName=${encodeURIComponent(enrollment.title)}&currentDay=${String(displayDay(enrollment.current_day, enrollment.secured_today))}&durationDays=14` as never,
      );
    },
    [router],
  );

  const onPressPrimaryCTA = useCallback(() => {
    if (todayState.enrollments.length === 0) {
      track({ name: "discover_challenge_tapped" });
      router.push(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (tasksRemaining > 0) {
      const next = pickProofTask(todayState);
      if (next && !next.task.done) {
        track({ name: "task_completed" });
        onPressTask(next);
      }
      return;
    }
  }, [todayState, tasksRemaining, onPressTask, router]);

  const onPressBell = useCallback(() => {
    router.push(`${ROUTES.ACTIVITY}?tab=notifications` as never);
  }, [router]);

  const onJeopardyFinish = useCallback(() => {
    setShowJeopardyModal(false);
    const next = pickProofTask(todayState);
    if (next && !next.task.done) onPressTask(next);
    else router.push(ROUTES.TABS_DISCOVER as never);
  }, [todayState, onPressTask, router]);

  const onJeopardyFreeze = useCallback(() => {
    setShowJeopardyModal(false);
    setShowFreezeModal(true);
  }, []);

  const onJeopardyDismiss = useCallback(() => {
    setShowJeopardyModal(false);
  }, []);

  const liveFeedQuery = useQuery({
    queryKey: ["liveFeed", feedScope, user?.id ?? ""],
    queryFn: () =>
      trpcQuery(TRPC.feed.getLiveFeed, { scope: feedScope, limit: 20 }) as Promise<{
        posts: LiveFeedPost[];
      }>,
    enabled: !isGuest && !!user?.id,
    staleTime: 60 * 1000,
  });

  const awayCount = useMemo(() => {
    const ids = new Set(
      (liveFeedQuery.data?.posts ?? [])
        .map((p) => p.userId)
        .filter((id) => id && id !== user?.id),
    );
    return ids.size;
  }, [liveFeedQuery.data?.posts, user?.id]);

  const nextBadge = useMemo(() => {
    const mark = nextProfileV2Badge({
      bestStreak: resolvedStats?.longestStreak ?? streak ?? 0,
      verifiedDays: resolvedStats?.totalDaysSecured ?? 0,
    });
    if (!mark) return { name: "First badge", progress: 1 };
    return { name: mark.name, progress: mark.progress };
  }, [resolvedStats?.longestStreak, resolvedStats?.totalDaysSecured, streak]);

  const firstProofEver =
    (resolvedStats?.totalDaysSecured ?? 0) === 0 && todayState.secured_date_keys.length === 0;

  const proof = useMemo(
    () => proofCard(todayState, firstProofEver),
    [todayState, firstProofEver],
  );

  const guestKeyExtractor = useCallback((item: { key: string }) => item.key, []);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <FlashList
          data={[{ key: "guest-home" }]}
          keyExtractor={guestKeyExtractor}
          renderItem={() => (
            <View style={s.guestWrap}>
              <Text style={s.guestTitle}>GRIIT</Text>
              <Text style={s.guestBody}>
                Sign in to start your discipline streak and see what your friends are doing.
              </Text>
            </View>
          )}
          contentContainerStyle={s.guestList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={s.container}>
        <LiveFeedSection
          refreshing={todayQuery.isRefetching}
          onRefresh={refresh}
          scope={feedScope}
          onScopeChange={setFeedScope}
          hideHeaderToggle
          ListHeaderComponent={
            <HomeV3
              title={greetingTitle(profile ?? {})}
              streak={streak ?? 0}
              streakLine={todayState.secured ? "Day secured." : "Post today to start."}
              proof={proof}
              weekFilled={week.secured}
              todayIndex={week.todayIndex}
              fillToday={todayState.secured}
              feedScope={feedScope}
              onChangeFeedScope={setFeedScope}
              onPressBell={onPressBell}
              onPressProof={onPressPrimaryCTA}
              awayCount={awayCount}
              freezesLeft={freezeStatusQuery.data?.remaining ?? 0}
              badgeName={nextBadge.name}
              badgePct={Math.round(nextBadge.progress * 100)}
              loading={todayQuery.isPending && !todayQuery.data}
            />
          }
        />
        <StreakFreezeModal
          visible={showFreezeModal}
          streakCount={streak ?? 0}
          freezesRemaining={profile?.streak_freezes_remaining ?? 1}
          onUseFreeze={() => setShowFreezeModal(false)}
          onLetReset={() => setShowFreezeModal(false)}
        />
        <JeopardyModal
          visible={showJeopardyModal}
          streak={streak ?? 0}
          minutesRemaining={minutesRemaining}
          freezesAvailable={freezeStatusQuery.data?.remaining ?? 0}
          onPressFinish={onJeopardyFinish}
          onPressFreeze={onJeopardyFreeze}
          onDismiss={onJeopardyDismiss}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_V3.color.canvas },
  guestWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  guestList: { paddingBottom: DS_V3.space.xs * 24 },
  guestTitle: {
    fontSize: DS_V3.type.display.fontSize,
    lineHeight: DS_V3.type.display.lineHeight,
    fontWeight: DS_V3.type.display.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  guestBody: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
