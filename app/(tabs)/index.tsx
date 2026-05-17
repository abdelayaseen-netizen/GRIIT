import React, { useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { InlineError } from "@/components/InlineError";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Bell, ChevronRight, Target } from "lucide-react-native";
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
import { ActiveTaskCard } from "@/components/home/ActiveTaskCard";
import StreakHeroV3 from "@/components/home/StreakHeroV3";
import DailyBonus from "@/components/home/DailyBonusV2";
import GoalCard from "@/components/home/GoalCard";
import PointsExplainer from "@/components/home/PointsExplainer";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonHomeChallengeCard } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_SPACING_V2, DS_TYPOGRAPHY } from "@/lib/design-system"
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
  const scrollRef = useRef<FlashList<{ key: string }> | null>(null);
  const goalsSectionYRef = useRef(0);

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

  type ChallengeGoalGroup = {
    activeChallengeId: string;
    challengeId: string;
    challengeName: string;
    currentDay: number;
    durationDays: number;
    goals: { id: string; title: string; completed: boolean; taskType: string; taskConfig: string }[];
  };

  const challengeGroups: ChallengeGoalGroup[] = useMemo(() => {
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

  const scrollToGoalsSection = useCallback(() => {
    scrollRef.current?.scrollToOffset({
      offset: Math.max(0, goalsSectionYRef.current - 12),
      animated: true,
    });
  }, []);

  const isCompleteForToday = useCallback((group: ChallengeGoalGroup) => {
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

  const homeState = useMemo(() => {
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
    const minutesToMidnight = Math.floor(
      (midnight.getTime() - now.getTime()) / 60000,
    );
    return computeHomeState({ streak, tasksRemaining, minutesToMidnight });
  }, [streak, challengeGroups]);

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
  const keyExtractorIncompleteGroup = useCallback((group: ChallengeGoalGroup) => group.activeChallengeId, []);
  const keyExtractorCompletedGroup = useCallback(
    (group: ChallengeGoalGroup) => `${group.activeChallengeId}-completed`,
    []
  );

  const renderIncompleteGoalGroup = useCallback(
    ({ item: group, index }: { item: ChallengeGoalGroup; index: number }) => {
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
    ({ item: group }: { item: ChallengeGoalGroup }) => (
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

  const homeRootContent = useMemo(
    () => (
      <View>
        {leaveChallengeError ? (
          <InlineError message={leaveChallengeError} onDismiss={() => setLeaveChallengeError(null)} />
        ) : null}
        <View style={s.headerRow}>
          <View style={s.headerTextCol}>
            <Text style={s.greeting}>
              {`${getGreeting()}, ${profilePrimaryName(
                profile ?? {},
                user?.email?.includes("@") ? user.email.split("@")[0] : undefined,
              ).split(" ")[0]}`}
            </Text>
            <Text style={s.todayTitle}>Today</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => router.navigate("/(tabs)/activity" as never)}
            style={s.bellButton}
          >
            <Bell size={16} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={1.75} />
            <View style={s.bellDot} />
          </Pressable>
        </View>

        {(() => {
          // StreakHeroV3 wiring (PR #19 bold home — light flame-inline variant).
          // Inline computations rather than helpers per migration plan; if
          // multiple screens need them, factor out in a follow-up.
          const totalTasksToday = challengeGroups.reduce(
            (sum, g) => sum + g.goals.length,
            0,
          );
          const tasksDoneToday = challengeGroups.reduce(
            (sum, g) => sum + g.goals.filter((gl) => gl.completed).length,
            0,
          );
          const tasksRemaining = Math.max(0, totalTasksToday - tasksDoneToday);
          const freezesAvailable = freezeStatus?.remaining ?? 0;
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          const minutesRemaining = Math.floor(
            (midnight.getTime() - now.getTime()) / 60000,
          );
          return (
            <View style={s.heroWrap}>
              <StreakHeroV3
                streak={streak}
                // TODO: wire lastStreak from store when previous-streak field
                // lands. Without this, the lost / comeback state never triggers
                // for users whose streak just broke.
                lastStreak={0}
                minutesRemaining={minutesRemaining}
                tasksRemaining={tasksRemaining}
                totalTasksToday={totalTasksToday}
                freezesAvailable={freezesAvailable}
                // TODO: wire freezeUsedToday from store when the
                // freeze-applied-today flag lands (profiles.last_freeze_used_at
                // exists in DB per lib/notifications.ts:13 — needs surfacing).
                // The `&& !hasAcknowledgedFreezeUsed` clause already exists so
                // dismissal works the moment the real flag arrives; until then
                // it's a no-op AND with `false`.
                freezeUsedToday={false && !hasAcknowledgedFreezeUsed}
                onStartFirstTask={scrollToGoalsSection}
                onSaveStreak={scrollToGoalsSection}
                onUseFreeze={() => setShowFreezeModal(true)}
                onAcknowledgeFreezeUsed={() => setHasAcknowledgedFreezeUsed(true)}
                onSkip={() => {}}
                onStartComeback={scrollToGoalsSection}
              />
            </View>
          );
        })()}

        {!FLAGS.PR3_ZERO_STATE_GATES || streak >= 1 ? (
          <WeekStrip
            securedDateKeys={securedKeys}
            currentStreak={streak}
            freezeCount={(stats as StatsFromApi | null)?.lastStandsAvailable ?? 0}
          />
        ) : null}

        {statsAllZero ? (
          <View style={s.welcomeCard}>
            <Text style={s.welcomeTitle}>Welcome to GRIIT</Text>
            <Text style={s.welcomeBody}>Your stats will appear here as you build your streak.</Text>
            <TouchableOpacity accessibilityRole="button"
              style={s.welcomeCta}
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              accessibilityLabel="Start your first challenge"
            >
              <Text style={s.welcomeCtaText}>Start your first challenge</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!FLAGS.PR3_ZERO_STATE_GATES || streak >= 1 ? <DailyBonus /> : null}

        <ActiveTaskCard />

        {homeQuery.isPending && !homeQuery.data ? (
          <View style={s.goalsSection}>
            <SkeletonHomeChallengeCard />
            <SkeletonHomeChallengeCard />
          </View>
        ) : homeQuery.isError ? (
          <ErrorState message="Couldn't load your dashboard" onRetry={() => void homeQuery.refetch()} />
        ) : challengeGroups.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No active challenges"
            subtitle="Find a challenge that pushes your limits"
            action={{
              label: "Browse challenges",
              onPress: () => router.push(ROUTES.TABS_DISCOVER as never),
            }}
          />
        ) : (
          <View
            style={s.goalsSection}
            onLayout={(e) => {
              goalsSectionYRef.current = e.nativeEvent.layout.y;
            }}
          >
            {incompleteChallenges.length === 0 ? (
              <View style={s.allDoneBanner}>
                <Text style={s.allDoneTitle}>🔥 All tasks secured for today</Text>
                <Text style={s.allDoneSubtitle}>Come back tomorrow to continue</Text>
              </View>
            ) : null}
            <SectionHeader
              title="Today's goals"
              actionLabel={`${incompleteChallenges.reduce((sum, g) => sum + g.goals.filter((gl) => !gl.completed).length, 0)} remaining`}
              onPressAction={() => {}}
            />
            <FlashList
              data={incompleteChallenges}
              keyExtractor={keyExtractorIncompleteGroup}
              scrollEnabled={false}
              nestedScrollEnabled
              renderItem={renderIncompleteGoalGroup}
              estimatedItemSize={320}
            />
            {completedTodayChallenges.length > 0 ? (
              <>
                <TouchableOpacity accessibilityRole="button"
                  style={s.completedHeader}
                  onPress={() => setCompletedExpanded((v) => !v)}
                  accessibilityLabel="Show or hide completed today tasks"
                  accessibilityState={{ expanded: completedExpanded }}
                >
                  <Text style={s.completedHeaderText}>Completed today ✓</Text>
                  <Text style={s.completedHeaderCount}>
                    {completedExpanded ? "Hide" : "Show"} ({completedTodayChallenges.length})
                  </Text>
                </TouchableOpacity>
                {completedExpanded ? (
                  <FlashList
                    data={completedTodayChallenges}
                    keyExtractor={keyExtractorCompletedGroup}
                    scrollEnabled={false}
                    nestedScrollEnabled
                    renderItem={renderCompletedGoalGroup}
                    estimatedItemSize={320}
                  />
                ) : null}
              </>
            ) : null}
          </View>
        )}

        <NextUnlock currentStreak={streak} />

        <View style={s.sectionDivider} />

        <DailyQuote />
      </View>
    ),
    [
      leaveChallengeError,
      streak,
      profile,
      user?.email,
      securedKeys,
      statsAllZero,
      router,
      stats,
      homeQuery,
      challengeGroups,
      incompleteChallenges,
      completedTodayChallenges,
      completedExpanded,
      scrollToGoalsSection,
      renderIncompleteGoalGroup,
      renderCompletedGoalGroup,
      keyExtractorIncompleteGroup,
      keyExtractorCompletedGroup,
      freezeStatus?.remaining,
      hasAcknowledgedFreezeUsed,
    ]
  );

  const renderHomeRootItem = useCallback(() => homeRootContent, [homeRootContent]);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <FlashList
          data={[{ key: "guest-home" }]}
          keyExtractor={keyExtractorHomeKey}
          renderItem={renderGuestHomeItem}
          estimatedItemSize={700}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaView style={s.container}>
      <FlashList
        ref={scrollRef}
        data={[{ key: "home-root" }]}
        keyExtractor={keyExtractorHomeKey}
        renderItem={renderHomeRootItem}
        estimatedItemSize={2200} // TODO(perf): tune with sampled item heights from production sessions
        refreshControl={
          <RefreshControl
            refreshing={homeQuery.isRefetching}
            onRefresh={refresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
  heroWrap: { paddingHorizontal: DS_SPACING_V2.md },
  headerRow: {
    paddingHorizontal: DS_SPACING.xl,
    paddingTop: DS_SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    marginRight: DS_SPACING.md,
  },
  header: { paddingHorizontal: DS_SPACING.xl, paddingTop: DS_SPACING.md },
  greeting: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED },
  todayTitle: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  word: {
    marginTop: 2,
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  bellButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.BG_CARD,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.ACCENT,
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
  pills: { flexDirection: "row", gap: 6 },
  pill: {
    backgroundColor: DS_COLORS.WHITE,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: DS_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pillWarm: { backgroundColor: DS_COLORS.ACCENT_TINT },
  pillPurple: { backgroundColor: DS_COLORS.purpleTintWarm },
  pillText: { fontSize: 12, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.TEXT_PRIMARY },
  statsRow: { marginTop: DS_SPACING.md, marginHorizontal: DS_SPACING.xl, flexDirection: "row", gap: DS_SPACING.sm },
  statTouchable: { flex: 1 },
  stat: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.button,
    paddingVertical: 14,
    paddingHorizontal: DS_SPACING.sm,
    alignItems: "center",
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: DS_RADIUS.SM,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValueNum: {
    fontSize: 22,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 26,
  },
  statLabelLower: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: DS_COLORS.BORDER,
    marginHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.sm,
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
  welcomeCard: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.button,
    padding: DS_SPACING.lg,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  welcomeBody: {
    marginTop: 6,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  welcomeCta: {
    marginTop: 12,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  welcomeCtaText: {
    color: DS_COLORS.WHITE,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  goalsSection: { paddingTop: 14 },
  goalsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
  },
  goalsSectionTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  goalsSectionCount: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.DISCOVER_CORAL,
  },
  completedHeader: {
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.xs,
    paddingHorizontal: DS_SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedHeaderText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  completedHeaderCount: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_MUTED,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  allDoneBanner: {
    marginHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  allDoneTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  allDoneSubtitle: {
    marginTop: 4,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
  },
});
