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
import type { StatsFromApi, TodayCheckinForUser } from "@/types";
import LiveFeedSection from "@/components/LiveFeedSection";
import { HomeV3, greetingTitle, type HomeV3Proof } from "@/components/home/HomeV3";
import { type StreakHeroV4Task } from "@/components/home/StreakHeroV4";
import { resolveDisplayedStreak, resolveHomeStatsReady, resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { DS_V3 } from "@/lib/design-system";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useFeedToggle } from "@/store/feedToggleStore";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { getTodayDateKey, getYesterdayDateKey, getCurrentWeekDateKeys } from "@/lib/date-utils";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";
import { JeopardyModal } from "@/components/home/JeopardyModal";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

type TaskRow = {
  id: string;
  title?: string;
  type?: string;
  required?: boolean;
  config?: { required?: boolean } & Record<string, unknown>;
};
type ActiveRow = {
  id: string;
  challenge_id: string;
  current_day?: number;
  challenges?: {
    id?: string;
    title?: string;
    duration_days?: number;
    challenge_tasks?: TaskRow[];
  };
};

type HomeData = {
  activeList: ActiveRow[];
  todayCheckins: TodayCheckinForUser[];
  securedDateKeys: string[];
};

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

  const homeQuery = useQuery({
    queryKey: ["home", "v2", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<HomeData> => {
      const settled = await Promise.allSettled([
        trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
        trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<TodayCheckinForUser[]>,
        trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
      ]);

      const activeRaw =
        settled[0].status === "fulfilled"
          ? settled[0].value
          : (captureError(settled[0].reason, "HomeListMyActive"), []);
      const checkinsRaw =
        settled[1].status === "fulfilled"
          ? settled[1].value
          : (captureError(settled[1].reason, "HomeGetTodayCheckinsForUser"), []);
      const securedRaw =
        settled[2].status === "fulfilled"
          ? settled[2].value
          : (captureError(settled[2].reason, "HomeGetSecuredDateKeys"), []);
      const activeList = (Array.isArray(activeRaw) ? activeRaw : []) as ActiveRow[];
      const todayCheckins = Array.isArray(checkinsRaw) ? checkinsRaw : [];
      const securedDateKeys = Array.isArray(securedRaw) ? securedRaw : [];
      return { activeList, todayCheckins, securedDateKeys };
    },
  });

  const heroTasks: StreakHeroV4Task[] = useMemo(() => {
    const activeList = homeQuery.data?.activeList ?? [];
    const checkins = homeQuery.data?.todayCheckins ?? [];
    const flat: StreakHeroV4Task[] = [];

    for (const ac of activeList) {
      const tasks = ac.challenges?.challenge_tasks ?? [];
      const required = tasks.filter((t) => {
        const cfg = t.config as { required?: boolean } | undefined;
        return (cfg?.required ?? true) === true;
      });
      const doneSet = new Set(
        checkins
          .filter((c) => c.active_challenge_id === ac.id && c.status === "completed")
          .map((c) => c.task_id),
      );
      const challengeName = ac.challenges?.title ?? "Challenge";
      const currentDay = ac.current_day ?? 1;
      const durationDays = ac.challenges?.duration_days ?? 14;

      for (const t of required) {
        const tType = String(t.type ?? "manual").toLowerCase();
        flat.push({
          id: t.id,
          name: t.title ?? t.type ?? "Task",
          description: challengeName,
          proofType: tType.includes("photo") ? "photo" : "text",
          done: doneSet.has(t.id),
          activeChallengeId: ac.id,
          challengeId: ac.challenge_id,
          challengeName,
          currentDay,
          durationDays,
          taskType: tType,
          taskConfig: buildTaskConfigParam(t as unknown as Record<string, unknown>),
        });
      }
    }
    return flat;
  }, [homeQuery.data?.activeList, homeQuery.data?.todayCheckins]);

  const resolvedStats = statsQuery.data ?? stats;
  const statsReady = resolveHomeStatsReady({
    queryFetched: statsQuery.isFetched,
    queryData: statsQuery.data,
    contextStats: stats,
  });
  const streak = resolveDisplayedStreak(statsReady, resolvedStats?.activeStreak);
  const securedDateKeys = useMemo(
    () => homeQuery.data?.securedDateKeys ?? [],
    [homeQuery.data?.securedDateKeys],
  );

  const homeTimeZone = resolveHomeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
    getDeviceIanaTimeZone(),
  );

  const todaySecured = useMemo(() => {
    return securedDateKeys.includes(getTodayDateKey(homeTimeZone));
  }, [securedDateKeys, homeTimeZone]);

  const heroMetrics = useMemo(() => {
    const totalTasksToday = heroTasks.length;
    const tasksDoneToday = heroTasks.filter((t) => t.done).length;
    const tasksRemaining = Math.max(0, totalTasksToday - tasksDoneToday);
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const minutesRemaining = Math.floor(
      (midnight.getTime() - now.getTime()) / 60000,
    );
    return { totalTasksToday, tasksDoneToday, tasksRemaining, minutesRemaining };
  }, [heroTasks]);

  const homeState = useMemo(
    () =>
      computeHomeState({
        streak: streak ?? 0,
        tasksRemaining: heroMetrics.tasksRemaining,
        minutesToMidnight: heroMetrics.minutesRemaining,
      }),
    [streak, heroMetrics.tasksRemaining, heroMetrics.minutesRemaining],
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

  // Week strip — Mon→Sun in profile IANA, else device IANA.
  // getTodayDateKey(undefined) is UTC: Friday 10:23pm ET highlights Saturday.
  const weekDateKeys = useMemo(() => getCurrentWeekDateKeys(homeTimeZone), [homeTimeZone]);

  const weekSecuredByIndex = useMemo(() => {
    const set = new Set(securedDateKeys);
    return weekDateKeys.map((key) => set.has(key));
  }, [weekDateKeys, securedDateKeys]);

  const todayWeekIndex = useMemo(() => {
    const todayKey = getTodayDateKey(homeTimeZone);
    const idx = weekDateKeys.indexOf(todayKey);
    return idx >= 0 ? idx : 0;
  }, [weekDateKeys, homeTimeZone]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (!profile || streak == null || streak <= 0) return;
    const keys = [...(homeQuery.data?.securedDateKeys ?? [])].sort();
    if (keys.length === 0) return;
    const lastKey = keys[keys.length - 1]!;
    const today = getTodayDateKey(homeTimeZone);
    const yesterday = getYesterdayDateKey(homeTimeZone);
    const missedWindow = lastKey !== today && lastKey !== yesterday;
    if (missedWindow) {
      setShowFreezeModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- profile identity covered via profile?.username
  }, [isGuest, user?.id, profile?.username, streak, homeQuery.data?.securedDateKeys]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (streak == null) return;
    void scheduleStreakReminder(streak);
  }, [isGuest, user?.id, streak]);

  // Jeopardy modal — show once per calendar day when streak is at risk.
  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (homeState !== 'streak_at_risk') return;
    const todayKey = getTodayDateKey(homeTimeZone);
    const storageKey = `griit_jeopardy_${todayKey}`;
    AsyncStorage.getItem(storageKey).then((shown) => {
      if (shown) return;
      void AsyncStorage.setItem(storageKey, 'true');
      setShowJeopardyModal(true);
    }).catch(() => {
      // non-fatal — show the modal anyway
      setShowJeopardyModal(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- homeState covers all inputs
  }, [isGuest, user?.id, homeState]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      void statsQuery.refetch();
    }, [isGuest, user?.id, statsQuery.refetch]),
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
    await Promise.all([homeQuery.refetch(), statsQuery.refetch(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [homeQuery, statsQuery, refetchAll, queryClient]);

  // ────────────── handlers ──────────────

  const onPressTask = useCallback(
    (task: StreakHeroV4Task) => {
      router.push(
        `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id)}&activeChallengeId=${encodeURIComponent(task.activeChallengeId)}&taskType=${encodeURIComponent(task.taskType)}&taskName=${encodeURIComponent(task.name)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(task.taskConfig)}&challengeName=${encodeURIComponent(task.challengeName)}&currentDay=${String(task.currentDay)}&durationDays=${String(task.durationDays)}` as never,
      );
    },
    [router],
  );

  const onPressPrimaryCTA = useCallback(() => {
    if (heroTasks.length === 0) {
      track({ name: 'discover_challenge_tapped' });
      router.push(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (heroMetrics.tasksRemaining > 0) {
      const next = heroTasks.find((t) => !t.done);
      if (next) {
        track({ name: 'task_completed' });
        onPressTask(next);
      }
      return;
    }
    // tasksRemaining === 0 and on home — no-op; "Come back tomorrow" is shown.
  }, [heroTasks, heroMetrics.tasksRemaining, onPressTask, router]);

  const onPressBell = useCallback(() => {
    router.push(`${ROUTES.ACTIVITY}?tab=notifications` as never);
  }, [router]);

  // Jeopardy modal handlers
  const onJeopardyFinish = useCallback(() => {
    setShowJeopardyModal(false);
    // Navigate to the first incomplete task
    const next = heroTasks.find((t) => !t.done);
    if (next) onPressTask(next);
    else router.push(ROUTES.TABS_DISCOVER as never);
  }, [heroTasks, onPressTask, router]);

  const onJeopardyFreeze = useCallback(() => {
    setShowJeopardyModal(false);
    setShowFreezeModal(true);
  }, []);

  const onJeopardyDismiss = useCallback(() => {
    setShowJeopardyModal(false);
  }, []);

  const proof: HomeV3Proof | null = useMemo(() => {
    const task = heroTasks.find((t) => !t.done) ?? heroTasks[0] ?? null;
    return {
      challenge: task?.challengeName ?? "",
      day: task?.currentDay ?? 1,
      taskText: task?.name ?? "",
      doneCount: heroMetrics.tasksDoneToday,
      totalCount: heroMetrics.totalTasksToday || 1,
      posted: todaySecured || (heroTasks.length > 0 && heroMetrics.tasksRemaining === 0),
    };
  }, [heroTasks, heroMetrics.tasksDoneToday, heroMetrics.totalTasksToday, todaySecured]);

  // ────────────── render ──────────────

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
          refreshing={homeQuery.isRefetching}
          onRefresh={refresh}
          scope={feedScope}
          onScopeChange={setFeedScope}
          hideHeaderToggle
          ListHeaderComponent={
            <HomeV3
              title={greetingTitle(profile ?? {})}
              streak={streak ?? 0}
              streakLine={todaySecured ? "Day secured." : "Post today to start."}
              proof={proof}
              weekFilled={weekSecuredByIndex}
              todayIndex={todayWeekIndex}
              feedScope={feedScope}
              onChangeFeedScope={setFeedScope}
              onPressBell={onPressBell}
              onPressProof={onPressPrimaryCTA}
              loading={homeQuery.isPending && !homeQuery.data}
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
          minutesRemaining={heroMetrics.minutesRemaining}
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
