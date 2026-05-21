import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  type LayoutChangeEvent,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronRight, Target } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import type { TodayCheckinForUser, StatsFromApi } from "@/types";
import DailyQuote from "@/components/home/DailyQuote";
import GoalCard from "@/components/home/GoalCard";
import PointsExplainer from "@/components/home/PointsExplainer";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { HomeHeader, type HomeHeaderChallengeGoalGroup } from "@/components/home/HomeHeader";
import LiveFeedSection from "@/components/LiveFeedSection";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { profilePrimaryName } from "@/lib/profile-display";
import { useCelebrationStore } from "@/store/celebrationStore";
import { prefetchActiveChallengeById } from "@/lib/prefetch-queries";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { ReportChallengeModal } from "@/components/shared/ReportChallengeModal";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";
import { computeHomeState } from "@/lib/home-state";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

const RANK_LADDER = [
  { name: "Starter", days: 0 },
  { name: "Builder", days: 7 },
  { name: "Disciplined", days: 14 },
  { name: "Elite", days: 30 },
  { name: "Legend", days: 75 },
] as const;

function rankLadderIndex(streak: number): number {
  for (let i = RANK_LADDER.length - 1; i >= 0; i--) {
    if (streak >= RANK_LADDER[i]!.days) return i;
  }
  return 0;
}

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
  /** `listMyActive` selects `active_challenges.*` — DB column is `current_day`. */
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function deriveRank(stats: StatsFromApi | null | undefined): string {
  if (stats?.tier && stats.tier.trim()) return stats.tier;
  const streak = stats?.activeStreak ?? 0;
  if (streak >= 75) return "Legend";
  if (streak >= 30) return "Elite";
  if (streak >= 14) return "Disciplined";
  if (streak >= 7) return "Builder";
  return "Starter";
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll, profile } = useApp();
  const [leaveChallengeError, setLeaveChallengeError] = React.useState<string | null>(null);
  const [leaveConfirmChallengeId, setLeaveConfirmChallengeId] = React.useState<string | null>(null);
  const [longPressMenuChallenge, setLongPressMenuChallenge] = React.useState<{ id: string; title: string } | null>(null);
  const [reportingChallengeId, setReportingChallengeId] = React.useState<string | null>(null);
  const [reportingChallengeTitle, setReportingChallengeTitle] = React.useState<string | undefined>(undefined);
  const [showPointsExplainer, setShowPointsExplainer] = React.useState(false);
  const [completedExpanded, setCompletedExpanded] = React.useState(true);
  const prevCompletedCount = React.useRef(0);
  const [showFreezeModal, setShowFreezeModal] = React.useState(false);
  const [showRankModal, setShowRankModal] = React.useState(false);
  const [showFreezeInfoModal, setShowFreezeInfoModal] = React.useState(false);
  // StreakHeroV3 freeze-used acknowledgement (PR#2 of design system v2 migration).
  // FIXME: persist to AsyncStorage with today's date as key once the
  // freeze-used real flag (profiles.last_freeze_used_at) is surfaced to the
  // client. Today this only matters within a single session — when the user
  // backgrounds and returns, they'd see the freeze-used card again, which is
  // fine for now since freezeUsedToday is hardcoded false anyway.
  const [hasAcknowledgedFreezeUsed, setHasAcknowledgedFreezeUsed] =
    React.useState(false);

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

  const challengeGroups: HomeHeaderChallengeGoalGroup[] = useMemo(() => {
    const activeList = homeQuery.data?.activeList ?? [];
    const checkins = homeQuery.data?.todayCheckins ?? [];

    return activeList.map((ac: ActiveRow) => {
      const tasks = ac.challenges?.challenge_tasks ?? [];
      const required = tasks.filter((t) => {
        const cfg = t.config as { required?: boolean } | undefined;
        return (cfg?.required ?? true) === true;
      });
      const doneSet = new Set(
        checkins
          .filter((c) => c.active_challenge_id === ac.id && c.status === "completed")
          .map((c) => c.task_id)
      );
      return {
        activeChallengeId: ac.id,
        challengeId: ac.challenge_id,
        challengeName: ac.challenges?.title ?? "Challenge",
        currentDay: ac.current_day ?? 1,
        durationDays: ac.challenges?.duration_days ?? 14,
        goals: required.map((t) => ({
          id: t.id,
          title: t.title ?? t.type ?? "Goal",
          completed: doneSet.has(t.id),
          taskType: String(t.type ?? "manual").toLowerCase(),
          taskConfig: buildTaskConfigParam(t as unknown as Record<string, unknown>),
        })),
      };
    });
  }, [homeQuery.data?.activeList, homeQuery.data?.todayCheckins]);

  const isCompleteForToday = useCallback((group: HomeHeaderChallengeGoalGroup) => {
    if (group.goals.length === 0) return false;
    return group.goals.every((goal) => goal.completed);
  }, []);
  const incompleteChallenges = useMemo(
    () => challengeGroups.filter((g) => !isCompleteForToday(g)),
    [challengeGroups, isCompleteForToday]
  );
  const completedTodayChallenges = useMemo(
    () => challengeGroups.filter((g) => isCompleteForToday(g)),
    [challengeGroups, isCompleteForToday]
  );
  React.useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    if (prevCompletedCount.current !== completedTodayChallenges.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      prevCompletedCount.current = completedTodayChallenges.length;
    }
  }, [completedTodayChallenges.length]);

  const streak = stats?.activeStreak ?? 0;

  const heroMetrics = useMemo(() => {
    const totalTasksToday = challengeGroups.reduce(
      (sum, g) => sum + g.goals.length,
      0,
    );
    const tasksDoneToday = challengeGroups.reduce(
      (sum, g) => sum + g.goals.filter((gl) => gl.completed).length,
      0,
    );
    const tasksRemaining = Math.max(0, totalTasksToday - tasksDoneToday);
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const minutesRemaining = Math.floor(
      (midnight.getTime() - now.getTime()) / 60000,
    );
    return { totalTasksToday, tasksDoneToday, tasksRemaining, minutesRemaining };
  }, [challengeGroups]);

  const homeState = useMemo(
    () =>
      computeHomeState({
        streak,
        tasksRemaining: heroMetrics.tasksRemaining,
        minutesToMidnight: heroMetrics.minutesRemaining,
      }),
    [streak, heroMetrics.tasksRemaining, heroMetrics.minutesRemaining],
  );

  const lastHomeStateFiredRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!FLAGS.PR3_HOME_STATE_ANALYTICS) return;
    if (lastHomeStateFiredRef.current === homeState) return;
    lastHomeStateFiredRef.current = homeState;
    track({ name: "home_state_viewed", state: homeState, streak });
  }, [homeState, streak]);

  const basePoints = (stats?.totalDaysSecured ?? 0) * 5;
  const activeCount = homeQuery.data?.activeList.length ?? 0;
  const points = activeCount > 0 ? Math.max(7, basePoints) : basePoints;
  const rank = deriveRank(stats ?? null);
  const securedKeys = useMemo(
    () => homeQuery.data?.securedDateKeys ?? [],
    [homeQuery.data?.securedDateKeys]
  );
  const completedChallengesCount = stats?.completedChallenges ?? 0;
  const statsAllZero = streak === 0 && points === 0 && completedChallengesCount === 0;

  const freezeStatus = freezeStatusQuery.data;
  const freezeCount = (stats as StatsFromApi | null)?.lastStandsAvailable ?? 0;

  const showCelebration = useCelebrationStore((s) => s.show);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    // Intentionally depend on profile?.username only — full profile object changes reference often.
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
    }, [isGuest, user?.id, stats?.activeStreak, showCelebration])
  );

  const refresh = useCallback(async () => {
    await Promise.all([homeQuery.refetch(), refetchAll()]);
    void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
  }, [homeQuery, refetchAll, queryClient]);

  const confirmLeaveChallenge = React.useCallback(async () => {
    const challengeId = leaveConfirmChallengeId;
    setLeaveConfirmChallengeId(null);
    if (!challengeId) return;
    try {
      await trpcMutate(TRPC.challenges.leave, { challengeId });
      try {
        track({ name: "challenge_left", challenge_id: challengeId });
      } catch {
        /* non-fatal */
      }
      void homeQuery.refetch();
      void refetchAll();
    } catch (err) {
      captureError(err, "HomeLeaveChallenge");
      const msg =
        err instanceof Error ? err.message : "Could not leave this challenge. Try again.";
      setLeaveChallengeError(msg);
    }
  }, [leaveConfirmChallengeId, homeQuery, refetchAll]);

  const onPressGoal = useCallback(
    (
      goalId: string,
      activeChallengeId: string,
      taskType: string,
      taskName: string,
      taskConfig: string,
      challengeTitle: string,
      currentDay: number,
      durationDays: number
    ) => {
      if (goalId === "__commit__") return;
      router.push(`${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(goalId)}&activeChallengeId=${encodeURIComponent(activeChallengeId)}&taskType=${encodeURIComponent(taskType)}&taskName=${encodeURIComponent(taskName)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(taskConfig)}&challengeName=${encodeURIComponent(challengeTitle)}&currentDay=${String(currentDay)}&durationDays=${String(durationDays)}` as never);
    },
    [router]
  );

  const keyExtractorHomeKey = useCallback((item: { key: string }) => item.key, []);
  const keyExtractorIncompleteGroup = useCallback((group: HomeHeaderChallengeGoalGroup) => group.activeChallengeId, []);
  const keyExtractorCompletedGroup = useCallback(
    (group: HomeHeaderChallengeGoalGroup) => `${group.activeChallengeId}-completed`,
    []
  );

  const renderIncompleteGoalGroup = useCallback(
    ({ item: group, index }: { item: HomeHeaderChallengeGoalGroup; index: number }) => {
      if (index > 0) {
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${group.challengeName}, day ${group.currentDay}`}
            style={s.compressedRow}
            onPress={() =>
              router.push(ROUTES.CHALLENGE_ID(group.challengeId) as never)
            }
            onLongPress={() =>
              setLongPressMenuChallenge({
                id: group.challengeId,
                title: group.challengeName,
              })
            }
          >
            <View style={s.compressedIcon}>
              <Target size={16} color={DS_COLORS.ACCENT} strokeWidth={1.75} />
            </View>
            <View style={s.compressedTitleCol}>
              <Text style={s.compressedTitle} numberOfLines={1}>
                {group.challengeName}
              </Text>
            </View>
            <View style={s.compressedDayPill}>
              <Text style={s.compressedDayPillText}>{`Day ${group.currentDay}`}</Text>
            </View>
            <ChevronRight size={16} color={DS_COLORS.TEXT_MUTED} />
          </TouchableOpacity>
        );
      }

      const firstIncompleteGoal = group.goals.find((gl) => !gl.completed);
      const taskCount = group.goals.length;
      const taskWord = taskCount === 1 ? "task" : "tasks";
      const estimatedMinutes = Math.max(15, taskCount * 10);
      const subtitle = `${group.durationDays}-day challenge · ${taskCount} ${taskWord} · ~${estimatedMinutes} min`;

      return (
        <View style={s.primaryGoalCard}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${group.challengeName}`}
            style={s.primaryGoalHeader}
            onPress={() =>
              router.push(ROUTES.CHALLENGE_ID(group.challengeId) as never)
            }
            onLongPress={() =>
              setLongPressMenuChallenge({
                id: group.challengeId,
                title: group.challengeName,
              })
            }
          >
            <View style={s.primaryGoalIcon}>
              <Target size={20} color={DS_COLORS.ACCENT} strokeWidth={1.75} />
            </View>
            <View style={s.primaryGoalText}>
              <Text style={s.primaryGoalTitle} numberOfLines={1}>
                {group.challengeName}
              </Text>
              <Text style={s.primaryGoalSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Start now: ${firstIncompleteGoal?.title ?? group.challengeName}`}
            style={s.primaryGoalCta}
            onPress={() => {
              if (!firstIncompleteGoal) {
                void prefetchActiveChallengeById(
                  queryClient,
                  group.activeChallengeId,
                );
                router.push(
                  ROUTES.CHALLENGE_ID(group.challengeId) as never,
                );
                return;
              }
              onPressGoal(
                firstIncompleteGoal.id,
                group.activeChallengeId,
                firstIncompleteGoal.taskType,
                firstIncompleteGoal.title,
                firstIncompleteGoal.taskConfig,
                group.challengeName,
                group.currentDay,
                group.durationDays,
              );
            }}
          >
            <Text style={s.primaryGoalCtaText}>Start now</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [router, onPressGoal, queryClient]
  );

  const renderCompletedGoalGroup = useCallback(
    ({ item: group }: { item: HomeHeaderChallengeGoalGroup }) => (
      <GoalCard
        defaultExpanded={false}
        challengeName={group.challengeName}
        goals={group.goals}
        currentDay={group.currentDay}
        durationDays={group.durationDays}
        completedSection
        onPressChallengeName={() => router.push(ROUTES.CHALLENGE_ID(group.challengeId) as never)}
        onPressGoal={() => {}}
        onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
        onPressInActiveChallenge={() => {
          void prefetchActiveChallengeById(queryClient, group.activeChallengeId);
        }}
        onLongPressChallenge={undefined}
        isError={homeQuery.isError}
      />
    ),
    [router, queryClient, homeQuery.isError]
  );

  const renderGuestHomeItem = useCallback(
    () => (
      <>
        <View style={s.header}>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.word}>GRIIT</Text>
        </View>
        <DailyQuote />
        <GoalCard goals={[]} onPressGoal={() => {}} onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)} />
        <DiscoverCTA onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
      </>
    ),
    [router]
  );

  const onPressBell = useCallback(() => {
    router.navigate("/(tabs)/activity" as never);
  }, [router]);

  const onDiscover = useCallback(() => {
    router.push(ROUTES.TABS_DISCOVER as never);
  }, [router]);

  const onClearLeaveChallengeError = useCallback(() => {
    setLeaveChallengeError(null);
  }, []);

  const onToggleCompletedExpanded = useCallback(() => {
    setCompletedExpanded((v) => !v);
  }, []);

  const onRetryHome = useCallback(() => {
    void homeQuery.refetch();
  }, [homeQuery]);

  const onUseFreeze = useCallback(() => {
    setShowFreezeModal(true);
  }, []);

  const onAcknowledgeFreezeUsed = useCallback(() => {
    setHasAcknowledgedFreezeUsed(true);
  }, []);

  const noopGoalsScroll = useCallback(() => {}, []);

  const onGoalsSectionLayout = useCallback((_e: LayoutChangeEvent) => {
    /* layout-Y tracking removed with the outer FlashList; goals sit immediately
     * below the StreakHero, so the auto-scroll-to-goals UX is no longer needed. */
  }, []);

  const firstName = useMemo(() => {
    return profilePrimaryName(
      profile ?? {},
      user?.email?.includes("@") ? user.email.split("@")[0] : undefined,
    ).split(" ")[0] ?? "";
  }, [profile, user?.email]);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <FlashList
          data={[{ key: "guest-home" }]}
          keyExtractor={keyExtractorHomeKey}
          renderItem={renderGuestHomeItem}
          contentContainerStyle={{ paddingBottom: 20 }}
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
          ListHeaderComponent={
            <HomeHeader
              leaveChallengeError={leaveChallengeError}
              onClearLeaveChallengeError={onClearLeaveChallengeError}
              greeting={getGreeting()}
              firstName={firstName}
              onPressBell={onPressBell}
              streak={streak}
              minutesRemaining={heroMetrics.minutesRemaining}
              tasksRemaining={heroMetrics.tasksRemaining}
              totalTasksToday={heroMetrics.totalTasksToday}
              freezesAvailable={freezeStatus?.remaining ?? 0}
              hasAcknowledgedFreezeUsed={hasAcknowledgedFreezeUsed}
              onStartFirstTask={noopGoalsScroll}
              onSaveStreak={noopGoalsScroll}
              onUseFreeze={onUseFreeze}
              onAcknowledgeFreezeUsed={onAcknowledgeFreezeUsed}
              onSkip={noopGoalsScroll}
              onStartComeback={noopGoalsScroll}
              securedDateKeys={securedKeys}
              freezeCount={freezeCount}
              statsAllZero={statsAllZero}
              onDiscover={onDiscover}
              homeIsPending={homeQuery.isPending}
              homeHasData={!!homeQuery.data}
              homeIsError={homeQuery.isError}
              onRetryHome={onRetryHome}
              challengeGroupsCount={challengeGroups.length}
              incompleteChallenges={incompleteChallenges}
              completedTodayChallenges={completedTodayChallenges}
              completedExpanded={completedExpanded}
              onToggleCompletedExpanded={onToggleCompletedExpanded}
              renderIncompleteGoalGroup={renderIncompleteGoalGroup}
              renderCompletedGoalGroup={renderCompletedGoalGroup}
              keyExtractorIncompleteGroup={keyExtractorIncompleteGroup}
              keyExtractorCompletedGroup={keyExtractorCompletedGroup}
              onGoalsSectionLayout={onGoalsSectionLayout}
            />
          }
        />
        <PointsExplainer
          visible={showPointsExplainer}
          onClose={() => setShowPointsExplainer(false)}
          currentPoints={points}
          currentRank={rank}
        />
        <ConfirmDialog
          visible={leaveConfirmChallengeId !== null}
          title="Leave challenge?"
          message="You'll lose your progress. This can't be undone."
          confirmLabel="Leave"
          destructive
          onCancel={() => setLeaveConfirmChallengeId(null)}
          onConfirm={() => void confirmLeaveChallenge()}
        />
        <StreakFreezeModal
          visible={showFreezeModal}
          streakCount={streak}
          freezesRemaining={profile?.streak_freezes_remaining ?? 1}
          onUseFreeze={() => {
            setShowFreezeModal(false);
          }}
          onLetReset={() => setShowFreezeModal(false)}
        />
        <Modal
          visible={showFreezeInfoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFreezeInfoModal(false)}
        >
          <View style={s.rankModalRoot}>
            <TouchableOpacity
              accessibilityRole="button"
              style={s.rankModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowFreezeInfoModal(false)}
              accessibilityLabel="Close"
            />
            <View style={s.rankModalSheet}>
              <Text style={s.rankModalTitle}>Streak freezes</Text>
              <Text style={{ fontSize: 15, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 22, marginBottom: 16 }}>
                If you miss one day, a streak freeze can keep your streak alive. Free accounts get 1 freeze per month;
                GRIIT Pro includes 4. Freezes reset about every 30 days.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Dismiss streak freeze info"
                style={s.rankRow}
                onPress={() => setShowFreezeInfoModal(false)}
              >
                <Text style={[s.rankRowName, { color: DS_COLORS.ACCENT }]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={longPressMenuChallenge !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setLongPressMenuChallenge(null)}
        >
          <View style={s.rankModalRoot}>
            <TouchableOpacity
              accessibilityRole="button"
              style={s.rankModalBackdrop}
              activeOpacity={1}
              onPress={() => setLongPressMenuChallenge(null)}
              accessibilityLabel="Close"
            />
            <View style={s.rankModalSheet}>
              <Text style={s.rankModalTitle}>{longPressMenuChallenge?.title ?? "Challenge"}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Report this challenge"
                style={s.rankRow}
                onPress={() => {
                  const ch = longPressMenuChallenge;
                  setLongPressMenuChallenge(null);
                  if (!ch) return;
                  setReportingChallengeId(ch.id);
                  setReportingChallengeTitle(ch.title);
                }}
              >
                <Text style={[s.rankRowName, { color: DS_COLORS.TEXT_PRIMARY }]}>Report this challenge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Leave challenge"
                style={s.rankRow}
                onPress={() => {
                  const ch = longPressMenuChallenge;
                  setLongPressMenuChallenge(null);
                  if (!ch) return;
                  setLeaveChallengeError(null);
                  setLeaveConfirmChallengeId(ch.id);
                }}
              >
                <Text style={[s.rankRowName, { color: DS_COLORS.DISCOVER_CORAL }]}>Leave challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ReportChallengeModal
          visible={reportingChallengeId !== null}
          challengeId={reportingChallengeId}
          challengeTitle={reportingChallengeTitle}
          onClose={() => {
            setReportingChallengeId(null);
            setReportingChallengeTitle(undefined);
          }}
        />
        <Modal
          visible={showRankModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRankModal(false)}
        >
          <View style={s.rankModalRoot}>
            <TouchableOpacity accessibilityRole="button"
              style={s.rankModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowRankModal(false)}
              accessibilityLabel="Close"
            />
            <View style={s.rankModalSheet}>
              <Text style={s.rankModalTitle}>Rank ladder</Text>
              {RANK_LADDER.map((r, i) => {
                const active = i === rankLadderIndex(streak);
                return (
                  <View key={r.name} style={s.rankRow}>
                    {active ? <View style={s.rankDot} /> : <View style={s.rankDotPlaceholder} />}
                    <Text style={[s.rankRowName, active && s.rankRowNameActive]}>{r.name}</Text>
                    <Text style={s.rankRowDays}>({r.days}d)</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  header: { paddingHorizontal: DS_SPACING.xl, paddingTop: DS_SPACING.md },
  greeting: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED },
  word: {
    marginTop: 2,
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  primaryGoalCard: {
    marginHorizontal: DS_SPACING.xl,
    marginVertical: DS_SPACING.sm,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1.5,
    borderColor: DS_COLORS.ACCENT,
    padding: DS_SPACING.lg,
  },
  primaryGoalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
    marginBottom: DS_SPACING.md,
  },
  primaryGoalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryGoalText: {
    flex: 1,
    minWidth: 0,
  },
  primaryGoalTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  primaryGoalSubtitle: {
    marginTop: 2,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  primaryGoalCta: {
    backgroundColor: DS_COLORS.ACCENT,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryGoalCtaText: {
    color: DS_COLORS.TEXT_ON_ACCENT,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  compressedRow: {
    marginHorizontal: DS_SPACING.xl,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.md,
    gap: DS_SPACING.sm,
  },
  compressedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  compressedTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  compressedTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  compressedDayPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  compressedDayPillText: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  rankModalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.xl,
  },
  rankModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
  },
  rankModalSheet: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    padding: DS_SPACING.lg,
    zIndex: 1,
  },
  rankModalTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: DS_SPACING.md,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    paddingVertical: 10,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.ACCENT,
  },
  rankDotPlaceholder: { width: 8, height: 8 },
  rankRowName: { flex: 1, fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_SECONDARY, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
  rankRowNameActive: { color: DS_COLORS.TEXT_PRIMARY },
  rankRowDays: { fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_MUTED, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
});
