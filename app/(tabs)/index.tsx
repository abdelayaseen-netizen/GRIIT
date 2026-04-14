import React, { useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from "react-native";
import { InlineError } from "@/components/InlineError";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Flame, Zap, Target } from "lucide-react-native";
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
import StreakHero from "@/components/home/StreakHero";
import DailyBonus from "@/components/home/DailyBonus";
import GoalCard from "@/components/home/GoalCard";
import PointsExplainer from "@/components/home/PointsExplainer";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import LiveFeedSection from "@/components/LiveFeedSection";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { EmptyState } from "@/components/ui/EmptyState";
import Card from "@/components/shared/Card";
import { SkeletonHomeChallengeCard } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
import { useCelebrationStore } from "@/store/celebrationStore";
import { prefetchActiveChallengeById } from "@/lib/prefetch-queries";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { ReportChallengeModal } from "@/components/shared/ReportChallengeModal";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { scheduleStreakReminder } from "@/lib/notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";

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
  const scrollRef = useRef<FlatList<{ key: string }>>(null);
  const goalsSectionYRef = useRef(0);
  const feedSectionYRef = useRef(0);

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

  const ringProgress = useMemo(() => {
    const total = challengeGroups.reduce((sum, g) => sum + g.goals.length, 0);
    const done = challengeGroups.reduce(
      (sum, g) => sum + g.goals.filter((gl) => gl.completed).length,
      0
    );
    return total > 0 ? done / total : 0;
  }, [challengeGroups]);

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
  const displayStreak = Math.max(1, streak);
  const basePoints = (stats?.totalDaysSecured ?? 0) * 5;
  const activeCount = homeQuery.data?.activeList.length ?? 0;
  const points = activeCount > 0 ? Math.max(7, basePoints) : basePoints;
  const rank = deriveRank(stats ?? null);
  const securedKeys = useMemo(
    () => homeQuery.data?.securedDateKeys ?? [],
    [homeQuery.data?.securedDateKeys]
  );
  const hasEverSecured = securedKeys.length > 0 || (stats?.totalDaysSecured ?? 0) > 0;
  const completedChallengesCount = stats?.completedChallenges ?? 0;
  const statsAllZero = streak === 0 && points === 0 && completedChallengesCount === 0;
  const showStatDash = statsAllZero;
  const streakPillLabel = streak === 0 ? "Day 1" : String(streak);

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
    ({ item: group, index }: { item: ChallengeGoalGroup; index: number }) => (
      <GoalCard
        defaultExpanded={index === 0}
        challengeName={group.challengeName}
        goals={group.goals}
        currentDay={group.currentDay}
        durationDays={group.durationDays}
        onPressChallengeName={() => router.push(ROUTES.CHALLENGE_ID(group.challengeId) as never)}
        onPressGoal={(goalId: string) => {
          const goal = group.goals.find((gl) => gl.id === goalId);
          if (!goal) return;
          onPressGoal(
            goalId,
            group.activeChallengeId,
            goal.taskType,
            goal.title,
            goal.taskConfig,
            group.challengeName,
            group.currentDay,
            group.durationDays
          );
        }}
        onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
        onPressInActiveChallenge={() => {
          void prefetchActiveChallengeById(queryClient, group.activeChallengeId);
        }}
        onLongPressChallenge={() => {
          setLongPressMenuChallenge({ id: group.challengeId, title: group.challengeName });
        }}
        isError={homeQuery.isError}
      />
    ),
    [router, onPressGoal, queryClient, homeQuery.isError]
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
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.word}>GRIIT</Text>
          </View>
          <View style={s.pills}>
            <View style={[s.pill, streak > 0 && s.pillWarm]}>
              <Flame size={13} color={DS_COLORS.DISCOVER_CORAL} />
              <Text style={s.pillText}>{showStatDash ? "—" : streakPillLabel}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button"
              style={[s.pill, points > 0 && s.pillPurple]}
              onPress={() => setShowPointsExplainer(true)}
              activeOpacity={0.7}
              accessibilityLabel={`${points} discipline points. Tap to learn more.`}
            >
              <Zap size={13} color={DS_COLORS.DISCOVER_BLUE} />
              <Text style={s.pillText}>{showStatDash ? "—" : String(points)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StreakHero streak={displayStreak} ringProgress={ringProgress} onStartFirstTask={scrollToGoalsSection} />

        <WeekStrip
          securedDateKeys={securedKeys}
          currentStreak={streak}
          freezeCount={(stats as StatsFromApi | null)?.lastStandsAvailable ?? 0}
          hasEverSecured={hasEverSecured}
        />

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
        ) : (
          <View style={s.statsRow}>
            <Card padded={false} containerStyle={s.stat}>
              <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.ACCENT_TINT }]}>
                <Flame size={16} color={DS_COLORS.DISCOVER_CORAL} />
              </View>
              <Text style={s.statValueNum}>{displayStreak}</Text>
              <Text style={s.statLabelLower}>streak</Text>
            </Card>
            <Card padded={false} containerStyle={s.stat}>
              <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.purpleTintWarm }]}>
                <Zap size={16} color={DS_COLORS.CATEGORY_MIND} />
              </View>
              <Text style={s.statValueNum}>{points}</Text>
              <Text style={s.statLabelLower}>points</Text>
            </Card>
            <TouchableOpacity accessibilityRole="button"
              style={s.statTouchable}
              activeOpacity={0.85}
              onPress={() => setShowRankModal(true)}
              accessibilityLabel="View rank ladder"
            >
              <Card padded={false} containerStyle={s.stat}>
                <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.GREEN_BG }]}>
                  <Target size={16} color={DS_COLORS.GREEN} />
                </View>
                <Text style={s.statValueNum} numberOfLines={1}>
                  {rank}
                </Text>
                <Text style={s.statLabelLower}>rank</Text>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        <DailyBonus />

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
            <FlatList
              data={incompleteChallenges}
              keyExtractor={keyExtractorIncompleteGroup}
              scrollEnabled={false}
              nestedScrollEnabled
              renderItem={renderIncompleteGoalGroup}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={8}
              removeClippedSubviews={Platform.OS === "android"}
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
                  <FlatList
                    data={completedTodayChallenges}
                    keyExtractor={keyExtractorCompletedGroup}
                    scrollEnabled={false}
                    nestedScrollEnabled
                    renderItem={renderCompletedGoalGroup}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={8}
                    removeClippedSubviews={Platform.OS === "android"}
                  />
                ) : null}
              </>
            ) : null}
          </View>
        )}

        <NextUnlock currentStreak={streak} />

        <View style={s.sectionDivider} />

        <View
          onLayout={(e) => {
            feedSectionYRef.current = e.nativeEvent.layout.y;
          }}
        >
          <LiveFeedSection
            onScrollToFeed={() => {
              scrollRef.current?.scrollToOffset({
                offset: Math.max(0, feedSectionYRef.current - 8),
                animated: true,
              });
            }}
          />
        </View>

        <DailyQuote />
      </View>
    ),
    [
      leaveChallengeError,
      streak,
      showStatDash,
      streakPillLabel,
      points,
      ringProgress,
      displayStreak,
      securedKeys,
      hasEverSecured,
      statsAllZero,
      router,
      stats,
      homeQuery,
      challengeGroups.length,
      incompleteChallenges,
      completedTodayChallenges,
      completedExpanded,
      rank,
      scrollToGoalsSection,
      renderIncompleteGoalGroup,
      renderCompletedGoalGroup,
      keyExtractorIncompleteGroup,
      keyExtractorCompletedGroup,
    ]
  );

  const renderHomeRootItem = useCallback(() => homeRootContent, [homeRootContent]);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <FlatList
          data={[{ key: "guest-home" }]}
          keyExtractor={keyExtractorHomeKey}
          renderItem={renderGuestHomeItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaView style={s.container}>
      <FlatList
        ref={scrollRef}
        data={[{ key: "home-root" }]}
        keyExtractor={keyExtractorHomeKey}
        renderItem={renderHomeRootItem}
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
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
  headerRow: {
    paddingHorizontal: DS_SPACING.xl,
    paddingTop: DS_SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { paddingHorizontal: DS_SPACING.xl, paddingTop: DS_SPACING.md },
  greeting: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED },
  word: {
    marginTop: 2,
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
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
