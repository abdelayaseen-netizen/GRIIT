import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Share,
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
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import type { TodayCheckinForUser } from "@/types";
import LiveFeedSection from "@/components/LiveFeedSection";
import { HomeHeaderV2 } from "@/components/home/HomeHeaderV2";
import {
  deriveStreakHeroV4State,
  type StreakHeroV4Task,
} from "@/components/home/StreakHeroV4";
import { DS_DAYLIGHT } from "@/lib/design-system";
import { profilePrimaryName } from "@/lib/profile-display";
import { useCelebrationStore } from "@/store/celebrationStore";
import { useFeedToggle } from "@/store/feedToggleStore";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

const FREEZE_MAX_PER_WEEK = 2;

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

const NEXT_BADGE_TARGETS = [3, 5, 7, 14, 30, 60, 100] as const;

function deriveNextBadge(streak: number): { name: string; daysAway: number; progress: number } {
  for (const target of NEXT_BADGE_TARGETS) {
    if (streak < target) {
      const previous =
        NEXT_BADGE_TARGETS[
          Math.max(0, NEXT_BADGE_TARGETS.indexOf(target) - 1)
        ] ?? 0;
      const span = Math.max(1, target - previous);
      const progressed = Math.max(0, streak - previous);
      return {
        name: `${target}-Day`,
        daysAway: target - streak,
        progress: Math.min(1, progressed / span),
      };
    }
  }
  return { name: "Legend", daysAway: 0, progress: 1 };
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile } = useApp();
  const [showFreezeModal, setShowFreezeModal] = React.useState(false);

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

  const streak = stats?.activeStreak ?? 0;
  const lastStreak = (stats as { lastStreak?: number } | null)?.lastStreak ?? 0;
  const securedDateKeys = useMemo(
    () => homeQuery.data?.securedDateKeys ?? [],
    [homeQuery.data?.securedDateKeys],
  );

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
        streak,
        tasksRemaining: heroMetrics.tasksRemaining,
        minutesToMidnight: heroMetrics.minutesRemaining,
      }),
    [streak, heroMetrics.tasksRemaining, heroMetrics.minutesRemaining],
  );

  const heroState = useMemo(
    () =>
      deriveStreakHeroV4State({
        streak,
        tasksRemaining: heroMetrics.tasksRemaining,
        totalTasksToday: heroMetrics.totalTasksToday,
        minutesRemaining: heroMetrics.minutesRemaining,
      }),
    [streak, heroMetrics],
  );

  const lastHomeStateFiredRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!FLAGS.PR3_HOME_STATE_ANALYTICS) return;
    if (lastHomeStateFiredRef.current === homeState) return;
    lastHomeStateFiredRef.current = homeState;
    track({ name: "home_state_viewed", state: homeState, streak });
  }, [homeState, streak]);

  const showCelebration = useCelebrationStore((s) => s.show);

  // Week strip — count of secured days in the current ISO week (Mon-Sun).
  const weekSecured = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const daysFromMonday = (dow + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - daysFromMonday);
    const set = new Set(securedDateKeys);
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (set.has(key)) count++;
    }
    return count;
  }, [securedDateKeys]);

  const nextBadge = useMemo(() => deriveNextBadge(streak), [streak]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (!profile || streak <= 0) return;
    const keys = [...(homeQuery.data?.securedDateKeys ?? [])].sort();
    if (keys.length === 0) return;
    const lastKey = keys[keys.length - 1]!;
    const tz = (profile as { timezone?: string | null })?.timezone;
    const today = getTodayDateKey(tz);
    const yesterday = getYesterdayDateKey(tz);
    const missedWindow = lastKey !== today && lastKey !== yesterday;
    if (missedWindow) {
      setShowFreezeModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- profile identity covered via profile?.username
  }, [isGuest, user?.id, profile?.username, streak, homeQuery.data?.securedDateKeys]);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    void scheduleStreakReminder(streak);
  }, [isGuest, user?.id, streak]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      let cancelled = false;
      const run = async () => {
        const n = stats?.activeStreak ?? 0;
        if (!STREAK_MILESTONES.some((m) => m === n)) return;
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
    }, [isGuest, user?.id, stats?.activeStreak, showCelebration]),
  );

  const refresh = useCallback(async () => {
    await Promise.all([homeQuery.refetch(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [homeQuery, refetchAll, queryClient]);

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
      router.push(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (heroMetrics.tasksRemaining > 0) {
      const next = heroTasks.find((t) => !t.done);
      if (next) onPressTask(next);
      return;
    }
    // tasksRemaining === 0 → already on home; no-op (could scroll to feed in
    // a follow-up).
  }, [heroTasks, heroMetrics.tasksRemaining, onPressTask, router]);

  const onPressFreeze = useCallback(() => {
    setShowFreezeModal(true);
  }, []);

  const onPressShare = useCallback(async () => {
    try {
      const username = profile?.username ?? "";
      const url = username ? `https://griit.app/u/${username}` : undefined;
      await Share.share({
        message: `I secured Day ${streak} on GRIIT`,
        ...(url ? { url } : {}),
      });
      try {
        track({ name: "streak_secured_shared", streak });
      } catch (err) {
        captureError(err, "HomeStreakSharedTrack");
      }
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") {
        captureError(err, "HomeStreakShare");
      }
    }
  }, [streak, profile?.username]);

  const onPressBell = useCallback(() => {
    router.push(`${ROUTES.ACTIVITY}?tab=notifications` as never);
  }, [router]);

  const onPressBadgeStat = useCallback(() => {
    router.push(`${ROUTES.TABS_PROFILE}?tab=badges` as never);
  }, [router]);

  const onPressFreezesStat = useCallback(() => {
    setShowFreezeModal(true);
  }, []);

  const firstName = useMemo(() => {
    return (
      profilePrimaryName(
        profile ?? {},
        user?.email?.includes("@") ? user.email.split("@")[0] : undefined,
      ).split(" ")[0] ?? ""
    );
  }, [profile, user?.email]);

  const heroProps = useMemo(
    () => ({
      streak,
      lastStreak,
      minutesRemaining: heroMetrics.minutesRemaining,
      tasksRemaining: heroMetrics.tasksRemaining,
      totalTasksToday: heroMetrics.totalTasksToday,
      freezesAvailable: freezeStatusQuery.data?.remaining ?? 0,
      freezeUsedToday: false,
      nextBadgeName: nextBadge.name,
      nextBadgeDaysAway: nextBadge.daysAway,
      tasks: heroTasks,
      onPressTask,
      onPressPrimaryCTA,
      onPressFreeze,
      onPressShare,
    }),
    [
      streak,
      lastStreak,
      heroMetrics,
      freezeStatusQuery.data?.remaining,
      nextBadge,
      heroTasks,
      onPressTask,
      onPressPrimaryCTA,
      onPressFreeze,
      onPressShare,
    ],
  );

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
          contentContainerStyle={{ paddingBottom: 96 }}
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
            <HomeHeaderV2
              firstName={firstName}
              hero={heroProps}
              heroState={heroState}
              onPressBell={onPressBell}
              weekSecured={weekSecured}
              weekTotal={7}
              freezesAvailable={freezeStatusQuery.data?.remaining ?? 0}
              freezesMaxPerWeek={FREEZE_MAX_PER_WEEK}
              nextBadgeName={nextBadge.name}
              nextBadgeProgress={nextBadge.progress}
              onPressFreezesStat={onPressFreezesStat}
              onPressBadgeStat={onPressBadgeStat}
              feedScope={feedScope}
              onChangeFeedScope={setFeedScope}
            />
          }
        />
        <StreakFreezeModal
          visible={showFreezeModal}
          streakCount={streak}
          freezesRemaining={profile?.streak_freezes_remaining ?? 1}
          onUseFreeze={() => setShowFreezeModal(false)}
          onLetReset={() => setShowFreezeModal(false)}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_DAYLIGHT.color.canvas },
  guestWrap: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: 32,
    gap: 12,
  },
  guestTitle: {
    fontSize: DS_DAYLIGHT.size.screenTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: 1,
  },
  guestBody: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    color: DS_DAYLIGHT.color.inkSecondary,
    lineHeight: 24,
  },
});
