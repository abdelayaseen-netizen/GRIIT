import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Users,
  Circle,
  RefreshCw,
  AlertTriangle,
  Shield,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { HomeScreenSkeleton } from "@/components/SkeletonLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Celebration from "@/components/Celebration";
import { RETENTION_CONFIG } from "@/lib/retention-config";
import { getMilestoneForStreak } from "@/lib/constants/milestones";
import { getYesterdayDateKey } from "@/lib/date-utils";
import { getHomeRetentionDerived } from "@/lib/home-derived";
import { getFirstSessionJustFinished, clearFirstSessionJustFinished } from "@/lib/starter-join";
import { track } from "@/lib/analytics";
import { useQuery } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import DailyStatus from "@/components/home/DailyStatus";
import ExploreChallengesButton from "@/components/home/ExploreChallengesButton";
import ActiveChallenges, { type ChallengeWithProgress } from "@/components/home/ActiveChallenges";
import LiveFeedCard, { type LiveFeedCardData } from "@/components/home/LiveFeedCard";
import { SuggestedFollows } from "@/components/SuggestedFollows";
import type { TodayCheckinForUser, ChallengeTaskFromApi, StatsFromApi } from "@/types";
import { ROUTES } from "@/lib/routes";
import { formatTimeRemaining } from "@/lib/challenge-timer";
import {
  DS_COLORS,
  DS_SPACING,
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_SHADOWS,
} from "@/lib/design-system";
import { GRIITWordmark } from "@/src/components/ui";

function getTimeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const ms = midnight.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

const MOTIVATION_QUOTES: { text: string; author: string }[] = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "— Start today" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "— Start today" },
  { text: "You don't have to be extreme, just consistent.", author: "— Start today" },
  { text: "The pain of discipline weighs ounces. The pain of regret weighs tons.", author: "— Start today" },
  { text: "Champions do consistently what others do occasionally.", author: "— Start today" },
  { text: "The only discipline that lasts is the one you build yourself.", author: "— Start today" },
];

function SyncingBanner({ onDismiss }: { onDismiss?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[syncingBannerStyles.wrap, { backgroundColor: "#FFF8E1" }]}>
      <RefreshCw size={14} color={colors.accent} />
      <Text style={[syncingBannerStyles.text, { color: DS_COLORS.textPrimary }]} numberOfLines={1}>
        Syncing... we{"'"}ll update when you{"'"}re back online.
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={12} style={syncingBannerStyles.dismiss}>
          <Text style={syncingBannerStyles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AnimatedProgressBar({ progress, color, trackBg }: { progress: number; color: string; trackBg?: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const bg = trackBg ?? colors.pill;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[progressStyles.track, { backgroundColor: bg }]}>
      <Animated.View style={[progressStyles.fill, { width: barWidth, backgroundColor: color }]} />
    </View>
  );
}

function TaskRow({
  title,
  completed,
  index,
}: {
  title: string;
  completed: boolean;
  index: number;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(completed ? 1 : 0)).current;
  const rowScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const prevCompletedRef = useRef(completed);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: completed ? 1 : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  }, [completed, checkAnim]);

  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      prevCompletedRef.current = true;
      Animated.sequence([
        Animated.timing(rowScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.spring(rowScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
      ]).start();
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.15, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
    if (!completed) prevCompletedRef.current = false;
  }, [completed, rowScale, pulseOpacity]);

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        taskStyles.row,
        { overflow: "hidden" as const, borderRadius: 10 },
        {
          opacity: scaleAnim,
          transform: [
            { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            { scale: rowScale },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.streak.shield, opacity: pulseOpacity, borderRadius: 10 },
        ]}
        pointerEvents="none"
      />
      <Animated.View style={{ transform: [{ scale: checkScale }] }}>
        <CheckCircle2
          size={20}
          color={completed ? colors.streak.shield : colors.border}
          fill={completed ? colors.streak.shield : "transparent"}
          strokeWidth={completed ? 0 : 1.5}
        />
      </Animated.View>
      <Text
        style={[
          taskStyles.title,
          { color: colors.text.primary },
          completed && { color: colors.text.tertiary },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const handleUserPress = useCallback((u: { username: string }) => {
    router.push(ROUTES.PROFILE_USERNAME(u.username) as never);
  }, [router]);
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const isGuest = useIsGuest();
  const guestQuote = useMemo(
    () => MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)],
    []
  );
  const { colors: themeColors } = useTheme();
  const {
    activeChallenge,
    challenge,
    computeProgress,
    stats,
    canSecureDay,
    secureDay,
    isLoading,
    isError,
    initialFetchDone,
    refetchAll,
    todayCheckins,
    todayDateLocal,
  } = useApp();

  const [showCelebration, setShowCelebration] = useState(false);
  const [optimisticDaySecured, setOptimisticDaySecured] = useState(false);
  const [celebrationPayload, setCelebrationPayload] = useState<{
    streak: number;
    pointsToNextTier?: number;
    nextTierName?: string;
  } | null>(null);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [showFirstSessionBanner, setShowFirstSessionBanner] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showLastStandUsedModal, setShowLastStandUsedModal] = useState(false);
  const [showStreakLostModal, setShowStreakLostModal] = useState(false);
  const streakLostShownRef = useRef(false);
  const [syncingBannerDismissed, setSyncingBannerDismissed] = useState(false);
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);
  const secureBtnScale = useRef(new Animated.Value(1)).current;
  const secureBtnGlow = useRef(new Animated.Value(0)).current;

  const leaderboardQuery = useQuery({
    queryKey: ["home", "leaderboard"],
    queryFn: () => trpcQuery("leaderboard.getWeekly", {}) as Promise<{ currentUserRank: number | null; totalSecuredToday: number; entries?: unknown[] }>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest,
  });
  const leaderboardData = leaderboardQuery.data ? { currentUserRank: leaderboardQuery.data.currentUserRank ?? null, totalSecuredToday: leaderboardQuery.data.totalSecuredToday ?? 0 } : null;
  const leaderboardEntries = (leaderboardQuery.data as { entries?: { userId: string; username: string; displayName?: string; avatarUrl?: string | null; currentStreak?: number; securedDaysThisWeek?: number }[] })?.entries ?? [];
  const leaderboardError = leaderboardQuery.isError;
  const leaderboardLoading = leaderboardQuery.isLoading;

  const liveFeedQuery = useQuery({
    queryKey: ["home", "feed", "live"],
    queryFn: () => trpcQuery(TRPC.feed.list, { limit: 5 }) as Promise<{ items: { id: string; event_type: string; display_name: string; username: string; avatar_url?: string | null; metadata?: Record<string, unknown>; created_at: string }[] }>,
    enabled: !isGuest,
    staleTime: 2 * 60 * 1000,
  });
  const liveFeedItems: LiveFeedCardData[] = useMemo(() => {
    const raw = liveFeedQuery.data?.items ?? [];
    return raw
      .filter((e) => e.event_type === "secured_day" || e.event_type === "last_stand")
      .slice(0, 5)
      .map((e) => {
        const meta = e.metadata ?? {};
        const created = e.created_at ? (Date.now() - new Date(e.created_at).getTime()) / 60000 : 0;
        return {
          type: "secured_day",
          username: e.display_name || e.username || "user",
          day: (meta.day_number as number) ?? 0,
          streakDays: (meta.streak_count as number) ?? 0,
          minutesAgo: Math.round(created),
        } as LiveFeedCardData;
      });
  }, [liveFeedQuery.data?.items]);

  const homeActiveQuery = useQuery({
    queryKey: ["home", "activeList"],
    queryFn: async (): Promise<{ challengesWithProgress: ChallengeWithProgress[]; totalRemaining: number }> => {
      const [list, checkins] = await Promise.all([
        trpcQuery(TRPC.challenges.listMyActive) as Promise<any[]>,
        trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<TodayCheckinForUser[]>,
      ]);
      const acList = Array.isArray(list) ? list : [];
      const checkinsByAcId: Record<string, Set<string>> = {};
      for (const c of checkins ?? []) {
        if (!checkinsByAcId[c.active_challenge_id]) checkinsByAcId[c.active_challenge_id] = new Set();
        if (c.status === "completed") checkinsByAcId[c.active_challenge_id].add(c.task_id);
      }
      let totalRemaining = 0;
      interface AcRow { id: string; challenge_id: string; challenges?: { id?: string; title?: string; challenge_tasks?: { id: string; title?: string; type?: string; required?: boolean }[] }; current_day?: number }
      const withProgress: ChallengeWithProgress[] = acList.map((ac: AcRow) => {
        const ch = ac.challenges;
        const tasks = ch?.challenge_tasks ?? [];
        const required = tasks.filter((t: { required?: boolean }) => t.required !== false);
        const completedSet = checkinsByAcId[ac.id] ?? new Set();
        const todayTasks = required.map((t: { id: string; title?: string; type?: string }) => ({
          id: t.id,
          title: t.title ?? t.type ?? "Task",
          completed: completedSet.has(t.id),
        }));
        const completedCount = todayTasks.filter((t: { completed: boolean }) => t.completed).length;
        totalRemaining += Math.max(0, required.length - completedCount);
        return {
          activeChallengeId: ac.id,
          challengeId: ch?.id ?? ac.challenge_id,
          challengeName: ch?.title ?? "Challenge",
          todayTaskProgress: required.length > 0 ? `${completedCount}/${required.length}` : "0/0",
          todayTasks,
        };
      });
      return { challengesWithProgress: withProgress, totalRemaining };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest,
  });
  const homeChallengesWithProgress = homeActiveQuery.data?.challengesWithProgress ?? null;
  const homeTotalRemaining = homeActiveQuery.data?.totalRemaining ?? 0;
  const homeDataError = homeActiveQuery.isError;

  useFocusEffect(
    useCallback(() => {
      getFirstSessionJustFinished().then((justFinished) => {
        if (justFinished) {
          setShowFirstSessionBanner(true);
          clearFirstSessionJustFinished();
        }
      });
    }, [])
  );

  const todayKey = todayDateLocal;
  const hasActiveChallenge = !!activeChallenge && !!challenge;

  const suggestedChallengesQuery = useQuery({
    queryKey: ["home", "suggestedChallenges"],
    queryFn: async () => {
      const data = (await trpcQuery("challenges.getFeatured", { limit: 3 })) as { items?: { id: string; title?: string; description?: string }[] } | { id: string; title?: string }[];
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !hasActiveChallenge,
  });
  const suggestedChallenges = suggestedChallengesQuery.data ?? [];

  const guestFeaturedQuery = useQuery({
    queryKey: ["home", "guestFeatured"],
    queryFn: async () => {
      const data = (await trpcQuery("challenges.getFeatured", { limit: 6 })) as { items?: { id: string; title?: string; description?: string; short_hook?: string }[] } | { id: string; title?: string; short_hook?: string }[];
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items;
    },
    staleTime: 5 * 60 * 1000,
    enabled: isGuest,
  });
  const guestFeatured = guestFeaturedQuery.data ?? [];

  const retention = useMemo(
    () => getHomeRetentionDerived(stats ?? null, todayKey, hasActiveChallenge, isGuest),
    [stats, todayKey, hasActiveChallenge, isGuest]
  );
  const {
    currentStreak,
    daysSinceLastSecure,
    showRecoveryBanner,
    showComebackMode,
    showRestartMode,
    canUseFreeze,
    freezesRemaining,
    lastStandsAvailable,
    isDaySecured,
  } = retention;
  const tierName = (stats as StatsFromApi)?.tier ?? null;
  const nextTierName = (stats as StatsFromApi)?.nextTierName ?? null;
  const pointsToNextTier = (stats as StatsFromApi)?.pointsToNextTier ?? 0;
  const yesterdayKey = getYesterdayDateKey();
  const daySecured = optimisticDaySecured || (computeProgress.progress === 100 && !canSecureDay);
  const isFirstTimeUser = (stats?.longestStreak ?? 0) === 0 && (stats?.totalDaysSecured ?? 0) === 0 && !hasActiveChallenge;

  useEffect(() => {
    if (isGuest || !initialFetchDone) return;
    const streakBroken = currentStreak === 0 && (stats?.longestStreak ?? 0) > 0;
    if (streakBroken && !streakLostShownRef.current) {
      streakLostShownRef.current = true;
      setShowStreakLostModal(true);
    }
  }, [isGuest, initialFetchDone, currentStreak, stats?.longestStreak]);

  const tasks = useMemo((): { id: string; title: string; completed: boolean }[] => {
    if (!challenge?.challenge_tasks) return [];
    return (challenge.challenge_tasks as ChallengeTaskFromApi[]).map((t) => ({
      id: t.id,
      title: t.title ?? t.type,
      completed: todayCheckins.some((c) => c.task_id === t.id && c.status === "completed"),
    }));
  }, [challenge?.challenge_tasks, todayCheckins]);

  const progressColor = daySecured
    ? themeColors.streak.shield
    : computeProgress.progress >= 50
    ? themeColors.accent
    : themeColors.text.muted;

  useEffect(() => {
    if (showComebackMode) {
      track({ name: "comeback_mode_started" });
    }
  }, [showComebackMode]);

  useEffect(() => {
    if (canSecureDay) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(secureBtnGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(secureBtnGlow, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [canSecureDay, secureBtnGlow]);

  useEffect(() => {
    if (!isError) setSyncingBannerDismissed(false);
  }, [isError]);

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([leaderboardQuery.refetch(), homeActiveQuery.refetch()]);
  }, [refetchAll, leaderboardQuery, homeActiveQuery]);

  const isRefetching = leaderboardQuery.isRefetching || homeActiveQuery.isRefetching;

  const handleSecureDay = useCallback(async () => {
    if (daysSinceLastSecure >= RETENTION_CONFIG.comebackModeMinDays) {
      track({ name: "comeback_day_secured" });
    }
    Animated.sequence([
      Animated.timing(secureBtnScale, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.spring(secureBtnScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    setOptimisticDaySecured(true);
    setShowCelebration(true);
    try {
      const result = await secureDay();
      if (!result) {
        setOptimisticDaySecured(false);
        setShowCelebration(false);
        setCelebrationPayload(null);
        Alert.alert("Error", "Couldn't secure day. Try again.");
        return;
      }
      const streak = result.newStreakCount ?? stats?.activeStreak ?? 0;
  const pointsToNext = (stats as StatsFromApi)?.pointsToNextTier ?? 0;
  const nextTier = (stats as StatsFromApi)?.nextTierName ?? null;
      setCelebrationPayload({ streak, pointsToNextTier: pointsToNext > 0 ? pointsToNext : undefined, nextTierName: nextTier ?? undefined });
      if (result.lastStandEarned) {
        track({ name: "last_stand_earned" });
      }
      const { isStreakMilestone } = await import("@/lib/constants/milestones");
      if (isStreakMilestone(streak)) {
        setShowMilestone(streak);
        track({ name: "milestone_unlocked", streak });
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
        }
      }
      leaderboardQuery.refetch();
      homeActiveQuery.refetch();
      const currentDay = activeChallenge?.current_day || 1;
      setTimeout(() => {
        setOptimisticDaySecured(false);
        router.push({
          pathname: ROUTES.SECURE_CONFIRMATION,
          params: {
            day: currentDay.toString(),
            streak: streak.toString(),
            totalDays: (challenge?.duration_days || 0).toString(),
            isHardMode: (challenge?.difficulty === "hard" || challenge?.difficulty === "extreme").toString(),
          },
        } as never);
      }, 1200);
    } catch {
      setOptimisticDaySecured(false);
      setShowCelebration(false);
      setCelebrationPayload(null);
      Alert.alert("Error", "Couldn't secure day. Try again.");
    }
  }, [secureDay, secureBtnScale, activeChallenge, stats, challenge, router, daysSinceLastSecure, leaderboardQuery, homeActiveQuery]);

  if (!isGuest && isLoading && !initialFetchDone) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <HomeScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.guestScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>🔥</Text>
            <Text style={[styles.heroTitle, { color: themeColors.text.primary }]}>Your discipline journey{'\n'}starts here.</Text>
            <Text style={[styles.heroSubtitle, { color: themeColors.text.secondary }]}>
              Join thousands building better habits.{'\n'}
              One day at a time. No excuses.
            </Text>
            <TouchableOpacity style={[styles.heroCTA, { backgroundColor: themeColors.accent ?? "#E8734A" }]} onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} activeOpacity={0.85}>
              <Text style={styles.heroCTAText}>Explore challenges</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.motivationCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.motivationQuote, { color: themeColors.text.secondary }]}>
              {`"${guestQuote.text}"`}
            </Text>
            <Text style={[styles.motivationAuthor, { color: themeColors.text.muted }]}>{guestQuote.author}</Text>
          </View>
          <View style={styles.howItWorks}>
            <Text style={[styles.guestSectionTitle, { color: themeColors.text.primary }]}>How GRIIT works</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>🎯</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: themeColors.text.primary }]}>Pick a challenge</Text>
                <Text style={[styles.stepDesc, { color: themeColors.text.secondary }]}>Choose from 7-day sprints to 75-day transformations</Text>
              </View>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>✅</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: themeColors.text.primary }]}>Complete daily tasks</Text>
                <Text style={[styles.stepDesc, { color: themeColors.text.secondary }]}>Workouts, journaling, cold showers — you decide</Text>
              </View>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>🔒</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: themeColors.text.primary }]}>Secure your day</Text>
                <Text style={[styles.stepDesc, { color: themeColors.text.secondary }]}>Lock in your progress. Build your streak. Earn your rank.</Text>
              </View>
            </View>
          </View>
          <View style={styles.guestFeaturedSection}>
            <Text style={[styles.guestSectionTitle, { color: themeColors.text.primary }]}>Popular challenges</Text>
            {(guestFeatured as { id: string; title?: string; short_hook?: string }[]).map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.guestChallengeCard, styles.yourPositionCard]}
                onPress={() => router.push(ROUTES.CHALLENGE_ID(challenge.id) as never)}
                activeOpacity={0.8}
              >
                <Text style={[styles.guestChallengeTitle, { color: themeColors.text.primary }]} numberOfLines={1}>{challenge.title ?? "Challenge"}</Text>
                {challenge.short_hook ? <Text style={[styles.guestChallengeHook, { color: themeColors.text.secondary }]} numberOfLines={1}>{challenge.short_hook}</Text> : null}
                <ChevronRight size={18} color={themeColors.text.muted} style={{ position: "absolute", right: 12, top: 18 }} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} activeOpacity={0.8}>
              <Text style={[styles.seeAllText, { color: themeColors.accent }]}>See all challenges →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.socialProof}>
            <Text style={[styles.socialProofText, { color: themeColors.text.secondary }]}>🔥 Join the movement. Every day counts.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const glowOpacity = secureBtnGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <Celebration
        visible={showCelebration}
        onComplete={() => { setShowCelebration(false); setCelebrationPayload(null); }}
        titleText={celebrationPayload ? "DAY SECURED ✓" : undefined}
        streakCount={celebrationPayload?.streak}
        pointsToNextTier={celebrationPayload?.pointsToNextTier}
        nextTierName={celebrationPayload?.nextTierName}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: DS_COLORS.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={themeColors.accent}
          />
        }
      >
        {isError && !syncingBannerDismissed && (
          <SyncingBanner onDismiss={() => setSyncingBannerDismissed(true)} />
        )}

        {showFirstSessionBanner && (
          <TouchableOpacity
            style={[styles.firstSessionBanner, { backgroundColor: themeColors.accentLight, borderColor: themeColors.accent + "40" }]}
            onPress={() => setShowFirstSessionBanner(false)}
            activeOpacity={0.9}
          >
            <Text style={[styles.firstSessionBannerText, { color: themeColors.text.primary }]}>
              Welcome to GRIIT. Your first win is in the books. 🔥
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <GRIITWordmark compact />
          <View style={styles.headerBadges}>
            <View style={styles.headerBadge} accessibilityLabel={`Score: ${stats?.longestStreak ?? 0}`} accessibilityRole="text">
              <TrendingUp size={14} color={DS_COLORS.success} />
              <Text style={[styles.headerBadgeText, { color: DS_COLORS.textPrimary }]}>{stats?.longestStreak ?? 0}</Text>
            </View>
            <View style={styles.headerBadge} accessibilityLabel={`Streak: ${currentStreak} days`} accessibilityRole="text">
              <Flame size={14} color={DS_COLORS.accent} />
              <Text style={[styles.headerBadgeText, { color: DS_COLORS.textPrimary }]}>{currentStreak}</Text>
            </View>
          </View>
        </View>

        {showRecoveryBanner && (
          <View style={[styles.recoveryBanner, { backgroundColor: themeColors.warningLight, borderColor: themeColors.warning + "40" }]}>
            <AlertTriangle size={18} color={themeColors.warning ?? themeColors.accent} />
            <View style={styles.recoveryBannerTextWrap}>
              <Text style={[styles.recoveryBannerTitle, { color: themeColors.text.primary }]}>
                {showRestartMode
                  ? "Welcome back. Start fresh today."
                  : showComebackMode
                  ? "Secure 3 days in a row to restore momentum."
                  : "You missed yesterday. Secure today to stay in the game."}
              </Text>
              {showRecoveryBanner && lastStandsAvailable >= 0 && (
                <Text style={[styles.recoveryBannerSub, { color: themeColors.text.secondary }]}>
                  Last Stands remaining: {lastStandsAvailable}
                </Text>
              )}
              {canUseFreeze && (
                <TouchableOpacity
                  style={[styles.freezeCta, { backgroundColor: themeColors.accent }]}
                  onPress={() => setShowFreezeModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freezeCtaText, { color: "#FFF" }]}>Use streak freeze</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {!isGuest && hasActiveChallenge && !isDaySecured && (
          <View style={styles.mainPromptBlock}>
            <Text style={[styles.secureTodayTitle, { color: themeColors.text.primary }]}>Secure today to protect your streak.</Text>
            <Text style={[styles.secureTodaySub, { color: themeColors.text.muted }]}>
              {(() => {
                const ac = activeChallenge as { ends_at?: string } | undefined;
                if (ac?.ends_at) return `${formatTimeRemaining(ac.ends_at)} remaining.`;
                const { hours, minutes } = getTimeUntilMidnight();
                return `${hours}h ${minutes}m remaining.`;
              })()}
            </Text>
            <View style={styles.metricsCard}>
              {nextTierName != null && pointsToNextTier > 0 && (
                <View style={styles.metricsRow}>
                  <Flame size={18} color={themeColors.text.secondary} />
                  <Text style={[styles.metricsText, { color: themeColors.text.secondary }]}>{pointsToNextTier} pts to {nextTierName}</Text>
                </View>
              )}
              {leaderboardData != null && (
                <View style={styles.metricsRow}>
                  <Users size={18} color={themeColors.text.secondary} />
                  <Text style={[styles.metricsText, { color: themeColors.text.secondary }]}>
                    {leaderboardData.totalSecuredToday} friends secured today
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {!isGuest && (
          <>
            <DailyStatus
              state={isDaySecured ? "SECURED" : "NOT_SECURED"}
              remainingTasksCount={homeTotalRemaining}
              onSecureToday={canSecureDay ? () => requireAuth("secure", handleSecureDay) : undefined}
              currentStreak={currentStreak}
              disciplinePointsLabel={tierName ? `${tierName} · ${stats?.totalDaysSecured ?? 0} days secured` : undefined}
            />
            <ExploreChallengesButton />
            {homeDataError ? (
              <View style={styles.yourPositionCard}>
                <AlertTriangle size={28} color={themeColors.text.muted} />
                <Text style={[styles.yourPositionLabel, { color: themeColors.text.muted }]}>CHALLENGES</Text>
                <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>Couldn&apos;t load your challenges. Check your connection and try again.</Text>
                <TouchableOpacity
                  style={[styles.secureNowButton, { backgroundColor: themeColors.accent }]}
                  onPress={() => homeActiveQuery.refetch()}
                  activeOpacity={0.85}
                  accessibilityLabel="Retry loading"
                  accessibilityRole="button"
                >
                  <RefreshCw size={18} color="#fff" />
                  <Text style={styles.secureNowButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ActiveChallenges
                challengesWithProgress={homeChallengesWithProgress}
                refreshKey={homeActiveQuery.dataUpdatedAt ?? 0}
              />
            )}
            {hasActiveChallenge && tasks.length > 0 && (
              <View style={styles.todaysResetCard}>
                <View style={styles.todaysResetHeader}>
                  <Clock size={18} color={themeColors.text.primary} />
                  <Text style={[styles.todaysResetTitle, { color: themeColors.text.primary }]}>Today&apos;s Reset</Text>
                  <Text style={[styles.todaysResetTime, { color: themeColors.text.muted }]}>
                    {(() => {
                      const ac = activeChallenge as { ends_at?: string } | undefined;
                      if (ac?.ends_at) return formatTimeRemaining(ac.ends_at) + " left";
                      const { hours, minutes } = getTimeUntilMidnight();
                      return `${hours}h ${minutes}m left`;
                    })()}
                  </Text>
                </View>
                <View style={[styles.todaysResetDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.todaysResetTaskList}>
                  {tasks.map((task) => (
                    <View key={task.id} style={styles.todaysResetTaskRow}>
                      <Circle size={18} color={themeColors.border} strokeWidth={2} />
                      <Text style={[styles.todaysResetTaskText, { color: themeColors.text.primary }, task.completed && styles.todaysResetTaskDone]}>{task.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {!isGuest && (
          <View style={styles.statsSummaryCard}>
            <View style={[styles.statsSummaryCol, { borderRightColor: DS_COLORS.border }]}>
              <Flame size={20} color={DS_COLORS.accent} />
              <Text style={[styles.statsSummaryValue, { color: DS_COLORS.textPrimary }]}>{currentStreak}</Text>
              <Text style={[styles.statsSummaryLabel, { color: DS_COLORS.textSecondary }]}>Streak</Text>
              {lastStandsAvailable >= 0 && (
                <Text style={[styles.statsSummaryLastStand, { color: DS_COLORS.textMuted }]}>Last Stands: {lastStandsAvailable}</Text>
              )}
            </View>
            <View style={[styles.statsSummaryCol, styles.statsSummaryColBorder, { borderRightColor: DS_COLORS.border }]}>
              <TrendingUp size={20} color={DS_COLORS.success} />
              <Text style={[styles.statsSummaryValue, { color: DS_COLORS.textPrimary }]}>{stats?.longestStreak ?? 0}</Text>
              <Text style={[styles.statsSummaryLabel, { color: DS_COLORS.textSecondary }]}>Score</Text>
            </View>
            <View style={styles.statsSummaryCol}>
              <Target size={20} color={DS_COLORS.accent} />
              <Text style={[styles.statsSummaryValue, { color: DS_COLORS.textPrimary }]}>{tierName ?? "Starter"}</Text>
              <Text style={[styles.statsSummaryLabel, { color: DS_COLORS.textSecondary }]}>Rank</Text>
            </View>
          </View>
        )}

        {!isGuest && (
          <View style={styles.disciplineWeekCard}>
            <View style={[styles.disciplineWeekIconWrap, { backgroundColor: themeColors.successLight }]}>
              <TrendingUp size={20} color={themeColors.success} />
            </View>
            <View style={styles.disciplineWeekBody}>
              <Text style={[styles.disciplineWeekTitle, { color: themeColors.text.primary }]}>
                <Text style={[styles.disciplineWeekNum, { color: themeColors.success }]}>+{stats?.longestStreak ?? 0}</Text> Discipline this week
              </Text>
              <Text style={[styles.disciplineWeekSub, { color: themeColors.success }]}>+100% from last week</Text>
            </View>
          </View>
        )}

        {false && hasActiveChallenge ? (
          <View style={styles.activeSection}>
            <Text style={styles.continueLabel}>Continue where you left off</Text>
            <Text style={styles.secureTodayTitle}>Secure today to protect your streak.</Text>
            {(() => {
              const { hours, minutes } = getTimeUntilMidnight();
              return (
                <Text style={styles.secureTodaySub}>{hours}h {minutes}m remaining.</Text>
              );
            })()}

            <View style={styles.metricsCard}>
              {nextTierName != null && pointsToNextTier > 0 && (
                <View style={styles.metricsRow}>
                  <Flame size={18} color={DS_COLORS.textMuted} />
                  <Text style={styles.metricsText}>{pointsToNextTier} pts to {nextTierName}</Text>
                </View>
              )}
              {(() => {
                const ld = leaderboardData;
                if (ld == null) return null;
                const count = ld!.totalSecuredToday;
                const show = count > 0 || ld!.currentUserRank != null;
                if (!show) return null;
                return (
                  <View style={styles.metricsRow}>
                    <Users size={18} color={DS_COLORS.textMuted} />
                    <Text style={styles.metricsText}>
                      {count} {count === 1 ? "person" : "people"} secured today
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View style={styles.todaysResetCard}>
              <View style={styles.todaysResetHeader}>
                <Clock size={18} color={DS_COLORS.accent} />
                <Text style={styles.todaysResetTitle}>Today{"'"}s Reset</Text>
                <Text style={styles.todaysResetTime}>
                  {(() => {
                    const { hours, minutes } = getTimeUntilMidnight();
                    return `${hours}h ${minutes}m left`;
                  })()}
                </Text>
              </View>
              {tasks.length > 0 ? (
                <View style={styles.todaysResetTaskList}>
                  {tasks.map((task) => (
                    <View key={task.id} style={styles.todaysResetTaskRow}>
                      <Circle size={18} color={DS_COLORS.border} strokeWidth={2} />
                      <Text style={[styles.todaysResetTaskText, task.completed && styles.todaysResetTaskDone]}>{task.title}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.todaysResetTaskList}>
                  <View style={styles.todaysResetTaskRow}>
                    <Text style={styles.todaysResetTaskText}>No tasks yet — open your challenge to see today’s list.</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.statsSummaryCard}>
              <View style={styles.statsSummaryCol}>
                <Flame size={20} color={DS_COLORS.accent} />
                <Text style={styles.statsSummaryValue}>{currentStreak}</Text>
                <Text style={styles.statsSummaryLabel}>Streak</Text>
                <Text style={styles.statsSummaryLastStand}>Last Stands: {lastStandsAvailable}</Text>
              </View>
              <View style={[styles.statsSummaryCol, styles.statsSummaryColBorder]}>
                <TrendingUp size={20} color={DS_COLORS.accent} />
                <Text style={styles.statsSummaryValue}>{stats?.longestStreak ?? 0}</Text>
                <Text style={styles.statsSummaryLabel}>Score</Text>
              </View>
              <View style={styles.statsSummaryCol}>
                <Target size={20} color={DS_COLORS.textMuted} />
                <Text style={styles.statsSummaryValue}>{tierName}</Text>
                <Text style={styles.statsSummaryLabel}>Rank</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.challengeCard, ((challenge as Record<string, unknown>)?.difficulty === "hard" || (challenge as Record<string, unknown>)?.difficulty === "extreme") && styles.challengeCardHard]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (activeChallenge) router.push(ROUTES.CHALLENGE_ID(activeChallenge.challenge_id) as never);
              }}
              activeOpacity={0.85}
              testID="home-challenge-card"
              accessibilityLabel="Open challenge"
              accessibilityRole="button"
            >
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Today</Text>
                  <Text style={[styles.progressValue, { color: progressColor }]}>
                    {computeProgress.verifiedCount}/{computeProgress.totalRequired}
                  </Text>
                </View>
                <AnimatedProgressBar progress={computeProgress.progress} color={progressColor} />
              </View>
              {tasks.length > 0 && (
                <View style={styles.taskList}>
                  {tasks.map((task, i) => (
                    <TaskRow key={task.id} title={task.title} completed={task.completed} index={i} />
                  ))}
                </View>
              )}
              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={16} color={DS_COLORS.textMuted} />
              </View>
            </TouchableOpacity>

            {canSecureDay && !optimisticDaySecured && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => requireAuth("secure", handleSecureDay)}
                testID="secure-day-button"
                accessibilityLabel="Secure your day"
                accessibilityRole="button"
              >
                <Animated.View style={[styles.secureDayButton, { transform: [{ scale: secureBtnScale }] }]}>
                  <Animated.View style={[styles.secureDayGlow, { opacity: glowOpacity }]} />
                  <Text style={styles.secureDayText}>Secure Day</Text>
                </Animated.View>
              </TouchableOpacity>
            )}

            {daySecured && (
              <View style={[styles.securedBanner, { backgroundColor: themeColors.successLight }]}>
                <CheckCircle2 size={16} color={themeColors.streak.shield} fill={themeColors.streak.shield} strokeWidth={0} />
                <Text style={[styles.securedText, { color: themeColors.text.primary }]}>Day {(activeChallenge as { current_day?: number })?.current_day ?? 1} Secured</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.welcomeBackCard, { backgroundColor: DS_COLORS.accentSoft, borderColor: DS_COLORS.accent }]}>
            <RefreshCw size={28} color={themeColors.accent} />
            <Text style={[styles.welcomeBackTitle, { color: themeColors.text.primary }]}>
              {isFirstTimeUser ? "Start your first challenge." : "Ready to restart?"}
            </Text>
            <Text style={[styles.welcomeBackSub, { color: themeColors.text.secondary }]}>
              {isFirstTimeUser
                ? "Pick a challenge, commit, and secure your first day."
                : "Your progress is saved. Pick up where you left off."}
            </Text>
            <TouchableOpacity
              style={[styles.pickChallengeButton, isFirstTimeUser ? { backgroundColor: themeColors.accent } : styles.pickChallengeButtonOutlined, isFirstTimeUser ? undefined : { borderColor: themeColors.border }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                requireAuth("join", () => router.push(ROUTES.TABS_DISCOVER as never));
              }}
              activeOpacity={0.85}
              testID="discover-cta"
              accessibilityLabel="Pick a challenge"
              accessibilityRole="button"
            >
              <Text style={[styles.pickChallengeButtonText, isFirstTimeUser ? undefined : { color: themeColors.text.primary }]}>
                {isFirstTimeUser ? "Find a challenge" : "Pick a Challenge"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!hasActiveChallenge && suggestedChallenges.length > 0 && (
          <View style={styles.suggestedChallengesSection}>
            <Text style={[styles.suggestedChallengesTitle, { color: DS_COLORS.textPrimary }]}>SUGGESTED FOR YOU</Text>
            {suggestedChallenges.slice(0, 3).map((c: { id: string; title?: string }) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.suggestedChallengeRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  requireAuth("join", () => router.push(ROUTES.CHALLENGE_ID(c.id) as never));
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.suggestedChallengeTitle, { color: themeColors.text.primary }]} numberOfLines={1}>{c.title ?? "Challenge"}</Text>
                <ChevronRight size={18} color={themeColors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.liveSectionHeader}>
          <View style={[styles.liveDot, { backgroundColor: themeColors.danger }]} />
          <Text style={[styles.liveTitle, { color: themeColors.text.primary }]}>LIVE</Text>
          <Text style={[styles.liveSubItalic, { color: themeColors.text.muted }]}>People are moving</Text>
        </View>

        {!isGuest && leaderboardData?.currentUserRank != null && (
          <View style={[styles.yourPositionInFeedCard, { backgroundColor: themeColors.accentLight, borderColor: themeColors.accent }]}>
            <Target size={28} color={themeColors.accent} />
            <Text style={[styles.yourPositionLabel, { color: themeColors.text.muted }]}>YOUR POSITION</Text>
            <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>
              You are ranked <Text style={styles.feedBold}>#{leaderboardData.currentUserRank}</Text> among friends this week.
            </Text>
            <Text style={[styles.yourPositionSub, { color: themeColors.text.secondary }]}>
              You&apos;re <Text style={[styles.feedBold, { color: themeColors.accent }]}>{Math.max(0, (stats?.longestStreak ?? 0) - currentStreak)} days</Text> away from your best streak.
            </Text>
          </View>
        )}

        {(() => {
          if (liveFeedItems.length === 0 && !liveFeedQuery.isLoading) {
            return (
              <>
                <View style={[styles.liveFeedEmpty, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Users size={32} color={themeColors.text.muted} style={{ marginBottom: 8 }} />
                  <Text style={[styles.liveFeedEmptyTitle, { color: themeColors.text.primary }]}>No activity yet</Text>
                  <Text style={[styles.liveFeedEmptySub, { color: themeColors.text.muted }]}>Join a challenge to see the community in action.</Text>
                </View>
                {!isGuest && leaderboardEntries.length > 0 && (
                  <SuggestedFollows
                    title="People to follow"
                    users={leaderboardEntries.map((e) => ({
                      userId: e.userId,
                      username: e.username,
                      displayName: e.displayName,
                      avatarUrl: e.avatarUrl ?? null,
                      currentStreak: e.currentStreak,
                      securedDaysThisWeek: e.securedDaysThisWeek,
                    }))}
                    currentUserId={user?.id}
                    onUserPress={handleUserPress}
                  />
                )}
              </>
            );
          }
          if (liveFeedItems.length > 0) {
            return liveFeedItems.map((item, i) => <LiveFeedCard key={item.type + i} data={item} />);
          }
          if (liveFeedQuery.isLoading) {
            return (
              <View style={[styles.liveFeedEmpty, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.liveFeedEmptySub, { color: themeColors.text.muted }]}>Loading activity…</Text>
              </View>
            );
          }
          return null;
        })()}

        {!isGuest && leaderboardError ? (
          <View style={styles.yourPositionCard}>
            <AlertTriangle size={28} color={themeColors.text.muted} />
            <Text style={[styles.yourPositionLabel, { color: themeColors.text.muted }]}>LEADERBOARD</Text>
            <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>Couldn&apos;t load leaderboard. Check your connection and try again.</Text>
            <TouchableOpacity
              style={[styles.secureNowButton, { backgroundColor: themeColors.accent }]}
              onPress={() => leaderboardQuery.refetch()}
              activeOpacity={0.85}
              accessibilityLabel="Retry loading"
              accessibilityRole="button"
            >
              <RefreshCw size={18} color="#fff" />
              <Text style={styles.secureNowButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !isGuest && leaderboardLoading && leaderboardData == null ? (
          <View style={styles.yourPositionCard}>
            <ActivityIndicator size="small" color={themeColors.accent} style={{ marginVertical: 8 }} />
            <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>Loading leaderboard…</Text>
          </View>
        ) : leaderboardData?.currentUserRank != null ? (
          <View style={styles.yourPositionCard}>
            <Target size={28} color={themeColors.accent} />
            <Text style={[styles.yourPositionLabel, { color: themeColors.text.muted }]}>YOUR STATUS</Text>
            <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>You&apos;re ranked #{leaderboardData.currentUserRank} among friends this week.</Text>
            <TouchableOpacity
              style={[styles.secureNowButton, { backgroundColor: themeColors.success }]}
              onPress={() => requireAuth("secure", () => router.push(ROUTES.TABS_DISCOVER as never))}
              activeOpacity={0.85}
              accessibilityLabel="Secure your day"
              accessibilityRole="button"
            >
              <Shield size={18} color="#fff" />
              <Text style={styles.secureNowButtonText}>Secure Now</Text>
            </TouchableOpacity>
          </View>
        ) : !isGuest && (
          <TouchableOpacity
            style={styles.yourPositionCard}
            onPress={() => router.push(ROUTES.TABS_ACTIVITY as never)}
            activeOpacity={0.85}
            accessibilityLabel="View activity"
            accessibilityRole="button"
          >
            <Target size={28} color={themeColors.accent} />
            <Text style={[styles.yourPositionLabel, { color: themeColors.text.muted }]}>LEADERBOARD</Text>
            <Text style={[styles.yourPositionText, { color: themeColors.text.primary }]}>Be the first this week.</Text>
            <Text style={styles.secureNowButtonText}>View Activity</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerTagline}>Only discipline shows here.</Text>
      </ScrollView>

      {showMilestone != null && (() => {
        const milestoneConfig = getMilestoneForStreak(showMilestone);
        const title = milestoneConfig?.title ?? `${showMilestone}-Day Streak`;
        const subtitle = milestoneConfig?.subtitle ?? "You are building discipline.";
        return (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={[styles.freezeModalBackdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={() => setShowMilestone(null)} />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.freezeModalTitle, { color: themeColors.text.primary }]}>{title}</Text>
              <Text style={[styles.freezeModalSub, { color: themeColors.text.secondary }]}>{subtitle}</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { marginBottom: 8, backgroundColor: themeColors.accent }]}
                onPress={async () => {
                  track({ name: "invite_shared", source: "milestone_modal" });
                  try {
                    const { shareMilestone } = await import("@/lib/share");
                    await shareMilestone({
                      streak: showMilestone,
                      milestoneMessage: subtitle,
                    });
                  } catch {
                    // User cancelled or failed
                  }
                  setShowMilestone(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.freezeModalCancel, { borderColor: themeColors.border }]}
                onPress={() => setShowMilestone(null)}
                activeOpacity={0.85}
              >
                <Text style={[styles.freezeModalCancelText, { color: themeColors.text.primary }]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        );
      })()}

      {showFreezeModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={[styles.freezeModalBackdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={() => !freezeSubmitting && setShowFreezeModal(false)} />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.freezeModalTitle, { color: themeColors.text.primary }]}>Use your streak freeze?</Text>
              <Text style={[styles.freezeModalSub, { color: themeColors.text.secondary }]}>
                This will save your streak. You get 1 free freeze per month.{freezesRemaining !== undefined && freezesRemaining >= 0 ? ` (${freezesRemaining} left this month)` : ""}
              </Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { backgroundColor: themeColors.accent }, freezeSubmitting && styles.freezeModalConfirmDisabled]}
                disabled={freezeSubmitting}
                onPress={async () => {
                  track({ name: "streak_freeze_used" });
                  setFreezeSubmitting(true);
                  try {
                    await trpcMutate("streaks.useFreeze", { dateKeyToFreeze: yesterdayKey });
                    await refetchAll();
                    setShowFreezeModal(false);
                  } catch (e: unknown) {
                    Alert.alert("Error", e instanceof Error ? e.message : "Could not use freeze.");
                  } finally {
                    setFreezeSubmitting(false);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>{freezeSubmitting ? "..." : "Use freeze"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.freezeModalCancel, { borderColor: themeColors.border }]} onPress={() => setShowFreezeModal(false)} disabled={freezeSubmitting} activeOpacity={0.8}>
                <Text style={[styles.freezeModalCancelText, { color: themeColors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showLastStandUsedModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={[styles.freezeModalBackdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={() => setShowLastStandUsedModal(false)} />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.freezeModalTitle, { color: themeColors.text.primary }]}>Last Stand used.</Text>
              <Text style={[styles.freezeModalSub, { color: themeColors.text.secondary }]}>Streak preserved.</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { backgroundColor: themeColors.accent }]}
                onPress={() => setShowLastStandUsedModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showStreakLostModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={[styles.freezeModalBackdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={() => setShowStreakLostModal(false)} />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.streakLostCard, { backgroundColor: DS_COLORS.surface }]}>
              <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.streakLostClose} onPress={() => setShowStreakLostModal(false)}>
                <Text style={[styles.streakLostCloseText, { color: DS_COLORS.textSecondary }]}>✕</Text>
              </TouchableOpacity>
              <View style={styles.streakLostIconWrap}>
                <Flame size={28} color={DS_COLORS.textMuted} />
              </View>
              <Text style={[styles.streakLostTitle, { color: DS_COLORS.textPrimary }]}>Streak lost.</Text>
              <Text style={[styles.streakLostSub, { color: DS_COLORS.textSecondary }]}>Start again today.</Text>
              <TouchableOpacity style={styles.streakLostButton} onPress={() => setShowStreakLostModal(false)} activeOpacity={0.85}>
                <Text style={styles.streakLostButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const syncingBannerStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    minHeight: 32,
  },
  text: {
    fontSize: 12,
    fontWeight: "500" as const,
    flex: 1,
  },
  dismiss: { padding: 4 },
  dismissText: { fontSize: 18, color: DS_COLORS.textSecondary, fontWeight: "600" as const },
});

const progressStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});

const taskStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  titleCompleted: {
    color: DS_COLORS.textMuted,
    textDecorationLine: "line-through",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingBottom: DS_SPACING.section,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: DS_SPACING.md,
    paddingBottom: DS_SPACING.lg,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.xs,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    borderRadius: 999,
    backgroundColor: DS_COLORS.surface,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  headerBadgeText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
  },
  mainPromptBlock: {
    marginBottom: DS_SPACING.lg,
  },
  secureTodayTitle: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.pageTitle.fontWeight,
    letterSpacing: DS_TYPOGRAPHY.pageTitle.letterSpacing,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.xs,
    lineHeight: DS_TYPOGRAPHY.pageTitle.lineHeight,
  },
  secureTodaySub: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
    marginBottom: DS_SPACING.md,
  },
  metricsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.cardGap,
    gap: DS_SPACING.md,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  metricsText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
  },
  todaysResetCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.cardGap,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  todaysResetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.md,
  },
  todaysResetTitle: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
  },
  todaysResetTime: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
  },
  todaysResetDivider: {
    height: 1,
    marginBottom: DS_SPACING.md,
  },
  todaysResetTaskList: {
    gap: DS_SPACING.sm,
  },
  todaysResetTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  todaysResetTaskText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  todaysResetTaskDone: {
    color: DS_COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  statsSummaryCard: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding + 2,
    marginBottom: DS_SPACING.sectionGap,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  statsSummaryCol: {
    flex: 1,
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  statsSummaryColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: DS_COLORS.border,
  },
  statsSummaryValue: {
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
  },
  statsSummaryLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statsSummaryLastStand: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  disciplineWeekCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.sectionGap,
    borderRadius: DS_RADIUS.cardAlt,
    backgroundColor: DS_COLORS.surface,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  disciplineWeekIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DS_SPACING.md,
  },
  disciplineWeekBody: { flex: 1 },
  disciplineWeekTitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "700",
  },
  disciplineWeekNum: { fontWeight: "700" },
  disciplineWeekSub: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    marginTop: 2,
  },
  welcomeBackCard: {
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.xxl,
    marginBottom: DS_SPACING.sectionGap,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: DS_COLORS.accentSoft + "40",
    borderColor: DS_COLORS.accent,
  },
  welcomeBackTitle: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.xs,
  },
  welcomeBackSub: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginBottom: DS_SPACING.lg,
    textAlign: "center",
  },
  pickChallengeButton: {
    backgroundColor: DS_COLORS.accent,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.xxl,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
  },
  pickChallengeButtonOutlined: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
  },
  pickChallengeButtonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  liveSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  liveSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveTitle: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: DS_COLORS.textPrimary,
  },
  liveSub: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
    flex: 1,
  },
  liveSubItalic: {
    fontSize: 13,
    fontStyle: "italic",
    flex: 1,
    textAlign: "right",
    color: DS_COLORS.textMuted,
  },
  liveFeedEmpty: {
    padding: DS_SPACING.xxl,
    marginBottom: DS_SPACING.lg,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.surface,
  },
  liveFeedEmptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  liveFeedEmptySub: {
    fontSize: 14,
    textAlign: "center",
  },
  suggestedChallengesSection: {
    marginBottom: 20,
  },
  suggestedChallengesTitle: {
    fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
    marginBottom: DS_SPACING.md,
  },
  suggestedChallengeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: DS_SPACING.cardPadding,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    marginBottom: DS_SPACING.sm,
  },
  suggestedChallengeTitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600",
    flex: 1,
    marginRight: DS_SPACING.sm,
  },
  yourPositionInFeedCard: {
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.lg,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
  },
  yourPositionSub: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    marginTop: 4,
  },
  feedCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  feedCardChallenge: {
    borderColor: DS_COLORS.accent + "40",
  },
  feedCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  feedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS_COLORS.chipFill,
  },
  feedAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.chipFill,
  },
  feedBody: {
    flex: 1,
    gap: 4,
  },
  feedMain: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
    lineHeight: 20,
  },
  feedUser: {
    fontWeight: "700" as const,
  },
  feedBold: {
    fontWeight: "700" as const,
  },
  feedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  feedStreak: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.accent,
  },
  feedTime: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
  feedDiscipline: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.success,
  },
  feedRank: {
    fontWeight: "700" as const,
    color: DS_COLORS.accent,
  },
  feedSub: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  feedHighlight: {
    fontWeight: "700" as const,
    color: "#D4A017",
  },
  feedCta: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.accent,
    marginTop: 4,
  },
  feedActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  feedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: DS_COLORS.chipFill,
    alignSelf: "flex-start",
  },
  feedPillText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  feedPillRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  feedTrophyWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  feedZapWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  feedOpenChallengeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DS_COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  feedOpenChallengeText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
  yourPositionCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding + 2,
    marginBottom: DS_SPACING.sectionGap,
    alignItems: "center",
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  guestChallengeCard: {
    alignItems: "flex-start",
    marginBottom: 12,
  },
  guestScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 28,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  heroCTA: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: DS_RADIUS.buttonPill,
    alignSelf: "stretch",
    alignItems: "center",
    marginHorizontal: 0,
    ...DS_SHADOWS.button,
  },
  heroCTAText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  motivationCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
  },
  motivationQuote: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    marginTop: 8,
  },
  howItWorks: {
    marginBottom: 28,
  },
  guestSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepEmoji: {
    fontSize: 32,
    width: 40,
    textAlign: "center",
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  guestFeaturedSection: {
    marginBottom: 28,
  },
  guestChallengeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  guestChallengeHook: {
    fontSize: 13,
    marginTop: 4,
  },
  seeAllButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: "600",
  },
  socialProof: {
    alignItems: "center",
    paddingVertical: 24,
  },
  socialProofText: {
    fontSize: 15,
    fontWeight: "600",
  },
  yourPositionLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  yourPositionText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  secureNowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    backgroundColor: DS_COLORS.accent,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.xxl,
    borderRadius: DS_RADIUS.button,
  },
  secureNowButtonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  footerTagline: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontStyle: "italic",
    color: DS_COLORS.textMuted,
    textAlign: "center",
    marginTop: DS_SPACING.lg,
    marginBottom: DS_SPACING.section,
  },
  activeSection: {
    gap: 4,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  missionControlCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dayNumberSection: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  dayNumberLarge: {
    fontSize: 56,
    fontWeight: "900" as const,
    color: DS_COLORS.textPrimary,
    letterSpacing: -2,
    lineHeight: 56,
  },
  dayNumberTotal: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: -0.5,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  modeTagHard: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(232,125,79,0.08)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.2)",
  },
  modeTagText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#E87D4F",
    letterSpacing: 0.5,
  },
  challengeTitleRow: {
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    paddingTop: 16,
  },
  challengeTitleMission: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  streakSectionSpaced: {
    gap: 16,
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  challengeCardHard: {
    borderColor: "rgba(232,125,79,0.25)",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: 0.2,
  },
  progressSection: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  taskList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    gap: 2,
  },
  secureDayButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.black,
    borderRadius: DS_RADIUS.button,
    paddingVertical: DS_SPACING.xl,
    overflow: "hidden",
  },
  secureDayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.success,
  },
  secureDayText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  securedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    backgroundColor: DS_COLORS.successSoft,
    borderRadius: DS_RADIUS.cardAlt,
    paddingVertical: DS_SPACING.lg,
    borderWidth: 1,
    borderColor: DS_COLORS.success + "30",
  },
  securedText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.success,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyProgressSection: {
    marginBottom: 32,
  },
  emptyProgressText: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: -0.5,
  },
  guestBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -20,
    marginBottom: 12,
    backgroundColor: DS_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  guestBarText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  guestBarCta: {
    backgroundColor: DS_COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  guestBarCtaText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
  },
  firstSessionBanner: {
    backgroundColor: (DS_COLORS.accentSoft ?? "#FFF5F0"),
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: (DS_COLORS.accent ?? "#E87D4F") + "40",
  },
  firstSessionBannerText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
  },
  recoveryBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: (DS_COLORS.warningSoft ?? DS_COLORS.accentSoft) || "#FFF5F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: (DS_COLORS.warning ?? DS_COLORS.accent) + "30",
  },
  recoveryBannerTextWrap: { flex: 1 },
  recoveryBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 4,
  },
  recoveryBannerSub: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: 8,
  },
  freezeCta: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: DS_COLORS.accent,
  },
  freezeCtaText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
  },
  freezeModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  freezeModalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  freezeModalCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  freezeModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
  },
  freezeModalSub: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    marginBottom: 20,
  },
  freezeModalConfirm: {
    backgroundColor: DS_COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  freezeModalConfirmDisabled: {
    opacity: 0.6,
  },
  freezeModalConfirmText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  freezeModalCancel: {
    alignItems: "center",
    paddingVertical: 10,
  },
  freezeModalCancelText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  streakLostCard: {
    borderRadius: 16,
    padding: 32,
    width: "80%",
    maxWidth: 340,
    alignItems: "center",
  },
  streakLostClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  streakLostCloseText: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  streakLostIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  streakLostTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginBottom: 6,
    textAlign: "center",
  },
  streakLostSub: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  streakLostButton: {
    backgroundColor: "#1A1A2E",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  streakLostButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  emptyTitleNew: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  ctaButton: {
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 16,
    minWidth: 240,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
    letterSpacing: 0.2,
  },
  supportingText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textMuted,
    textAlign: "center",
  },
});
