import React, { useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
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
import type { TodayCheckinForUser, StatsFromApi, ChallengeTaskFromApi } from "@/types";
import DailyQuote from "@/components/home/DailyQuote";
import StreakHero from "@/components/home/StreakHero";
import DailyBonus from "@/components/home/DailyBonus";
import GoalCard from "@/components/home/GoalCard";
import PointsExplainer from "@/components/home/PointsExplainer";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import LiveFeedSection from "@/components/LiveFeedSection";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { EmptyState } from "@/components/shared/EmptyState";
import Card from "@/components/shared/Card";
import { SkeletonHomeChallengeCard } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { useCelebrationStore } from "@/store/celebrationStore";
import { prefetchActiveChallengeById } from "@/lib/prefetch-queries";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StreakFreezeModal } from "@/components/StreakFreezeModal";
import { getTodayDateKey, getYesterdayDateKey } from "@/lib/date-utils";
import { scheduleStreakReminder } from "@/lib/notifications";

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

type TaskRow = { id: string; title?: string; type?: string; required?: boolean };
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

/** JSON for `app/task/complete` — matches TaskCompleteConfig fields from mapped challenge_tasks. */
function buildTaskConfigParam(task: ChallengeTaskFromApi | undefined): string {
  if (!task) return "{}";
  try {
    const t = task as Record<string, unknown>;
    return JSON.stringify({
      require_photo: t.require_photo ?? t.require_photo_proof,
      min_duration_minutes: t.min_duration_minutes ?? t.duration_minutes,
      scheduled_time: typeof t.scheduled_time === "string" ? t.scheduled_time : undefined,
      min_words: t.min_words,
      timer_direction: t.timer_direction,
      timer_hard_mode: t.timer_hard_mode ?? t.strict_timer_mode,
      require_heart_rate: t.require_heart_rate,
      heart_rate_threshold: t.heart_rate_threshold,
      require_location: t.require_location,
      location_name: t.location_name,
      location_latitude: t.location_latitude,
      location_longitude: t.location_longitude,
      location_radius_meters: t.location_radius_meters,
      journal_prompt: typeof t.journal_prompt === "string" ? t.journal_prompt : undefined,
    });
  } catch (err) {
    captureError(err, "HomeBuildTaskConfigParam");
    console.error("[Home] buildTaskConfigParam failed:", err);
    return "{}";
  }
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
  const [showPointsExplainer, setShowPointsExplainer] = React.useState(false);
  const [completedExpanded, setCompletedExpanded] = React.useState(true);
  const prevCompletedCount = React.useRef(0);
  const [showFreezeModal, setShowFreezeModal] = React.useState(false);
  const [showRankModal, setShowRankModal] = React.useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const goalsSectionYRef = useRef(0);
  const feedSectionYRef = useRef(0);

  const homeQuery = useQuery({
    queryKey: ["home", "v2", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
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
          : (console.error("[Home] listMyActive failed:", settled[0].reason), []);
      const checkinsRaw =
        settled[1].status === "fulfilled"
          ? settled[1].value
          : (console.error("[Home] getTodayCheckinsForUser failed:", settled[1].reason), []);
      const securedRaw =
        settled[2].status === "fulfilled"
          ? settled[2].value
          : (console.error("[Home] getSecuredDateKeys failed:", settled[2].reason), []);
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
      const required = tasks.filter((t) => t.required !== false);
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
          taskConfig: buildTaskConfigParam(t as ChallengeTaskFromApi),
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
    scrollRef.current?.scrollTo({
      y: Math.max(0, goalsSectionYRef.current - 12),
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
  const securedKeys = homeQuery.data?.securedDateKeys ?? [];
  const hasEverSecured = securedKeys.length > 0 || (stats?.totalDaysSecured ?? 0) > 0;
  const completedChallengesCount = stats?.completedChallenges ?? 0;
  const statsAllZero = streak === 0 && points === 0 && completedChallengesCount === 0;
  const showStatDash = statsAllZero;
  const streakPillLabel = streak === 0 ? "Day 1" : String(streak);

  const showCelebration = useCelebrationStore((s) => s.show);

  React.useEffect(() => {
    if (isGuest || !user?.id) return;
    if (!profile || streak <= 0) return;
    const keys = [...(homeQuery.data?.securedDateKeys ?? [])].sort();
    if (keys.length === 0) return;
    const lastKey = keys[keys.length - 1]!;
    const today = getTodayDateKey();
    const yesterday = getYesterdayDateKey();
    const missedWindow = lastKey !== today && lastKey !== yesterday;
    if (missedWindow) {
      setShowFreezeModal(true);
    }
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
      void homeQuery.refetch();
      void refetchAll();
    } catch (err) {
      captureError(err, "HomeLeaveChallenge");
      console.error("[Home] leave challenge failed:", err);
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
      const url = `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(goalId)}&activeChallengeId=${encodeURIComponent(activeChallengeId)}&taskType=${encodeURIComponent(taskType)}&taskName=${encodeURIComponent(taskName)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(taskConfig)}&challengeName=${encodeURIComponent(challengeTitle)}&currentDay=${String(currentDay)}&durationDays=${String(durationDays)}`;
      router.push(url as never);
    },
    [router]
  );

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={s.header}><Text style={s.greeting}>{getGreeting()}</Text><Text style={s.word}>GRIIT</Text></View>
          <DailyQuote />
          <GoalCard goals={[]} onPressGoal={() => {}} onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)} />
          <DiscoverCTA onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={homeQuery.isRefetching}
            onRefresh={refresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity
              style={[s.pill, points > 0 && s.pillPurple]}
              onPress={() => setShowPointsExplainer(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
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
            <TouchableOpacity
              style={s.welcomeCta}
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              accessibilityLabel="Start your first challenge"
              accessibilityRole="button"
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
            <TouchableOpacity
              style={s.statTouchable}
              activeOpacity={0.85}
              onPress={() => setShowRankModal(true)}
              accessibilityRole="button"
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
            {incompleteChallenges.map((group, index) => (
              <GoalCard
                key={group.activeChallengeId}
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
                  setLeaveChallengeError(null);
                  setLeaveConfirmChallengeId(group.challengeId);
                }}
                isError={homeQuery.isError}
              />
            ))}
            {completedTodayChallenges.length > 0 ? (
              <>
                <TouchableOpacity
                  style={s.completedHeader}
                  onPress={() => setCompletedExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="Show or hide completed today tasks"
                  accessibilityState={{ expanded: completedExpanded }}
                >
                  <Text style={s.completedHeaderText}>Completed today ✓</Text>
                  <Text style={s.completedHeaderCount}>
                    {completedExpanded ? "Hide" : "Show"} ({completedTodayChallenges.length})
                  </Text>
                </TouchableOpacity>
                {completedExpanded
                  ? completedTodayChallenges.map((group) => (
                      <GoalCard
                        key={`${group.activeChallengeId}-completed`}
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
                    ))
                  : null}
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
              scrollRef.current?.scrollTo({ y: Math.max(0, feedSectionYRef.current - 8), animated: true });
            }}
          />
        </View>

        <DailyQuote />
      </ScrollView>
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
          if (__DEV__) console.log("[StreakFreeze] Freeze used");
          setShowFreezeModal(false);
        }}
        onLetReset={() => setShowFreezeModal(false)}
      />
      <Modal
        visible={showRankModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRankModal(false)}
      >
        <View style={s.rankModalRoot}>
          <TouchableOpacity
            style={s.rankModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowRankModal(false)}
            accessibilityRole="button"
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
    fontWeight: "700",
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
  pillText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  statsRow: { marginTop: DS_SPACING.md, marginHorizontal: DS_SPACING.xl, flexDirection: "row", gap: DS_SPACING.sm },
  statTouchable: { flex: 1 },
  stat: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
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
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 26,
  },
  statLabelLower: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
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
    fontWeight: "700",
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
    borderRadius: 4,
    backgroundColor: DS_COLORS.ACCENT,
  },
  rankDotPlaceholder: { width: 8, height: 8 },
  rankRowName: { flex: 1, fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_SECONDARY, fontWeight: "600" },
  rankRowNameActive: { color: DS_COLORS.TEXT_PRIMARY },
  rankRowDays: { fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_MUTED, fontWeight: "600" },
  welcomeCard: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    padding: DS_SPACING.lg,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: "700",
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
    fontWeight: "700",
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
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  goalsSectionCount: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: "600",
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
    fontWeight: "700",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  completedHeaderCount: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_MUTED,
    fontWeight: "600",
  },
  allDoneBanner: {
    marginHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
    padding: DS_SPACING.lg,
    borderRadius: 14,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  allDoneTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  allDoneSubtitle: {
    marginTop: 4,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
  },
});
