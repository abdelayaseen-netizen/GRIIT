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
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Circle,
  RefreshCw,
  AlertTriangle,
  Shield,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumBadge } from "@/components/PremiumBadge";
import { HomeScreenSkeleton } from "@/components/SkeletonLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Celebration from "@/components/Celebration";
import { RETENTION_CONFIG } from "@/lib/retention-config";
import { getMilestoneForStreak } from "@/lib/constants/milestones";
import { getYesterdayDateKey } from "@/lib/date-utils";
import { getHomeRetentionDerived } from "@/lib/home-derived";
import { getFirstSessionJustFinished, clearFirstSessionJustFinished } from "@/lib/starter-join";
import { track } from "@/lib/analytics";
import { maybePromptForReview } from "@/lib/review-prompt";
import { requestNotificationPermissions } from "@/lib/notifications";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import ActiveChallenges, { type ChallengeWithProgress } from "@/components/home/ActiveChallenges";
import LiveFeedCard, { type LiveFeedCardData } from "@/components/home/LiveFeedCard";
import { SuggestedFollows } from "@/components/SuggestedFollows";
import type { TodayCheckinForUser, ChallengeTaskFromApi, StatsFromApi } from "@/types";
import { ROUTES } from "@/lib/routes";
import { useTheme } from "@/contexts/ThemeContext";
import { MOCK_FEED, MOCK_SUGGESTED, type MockFeedItem } from "@/constants/mockFeedData";
import { SURFACE_SUBTLE } from "@/constants/theme";
import { formatTimeRemaining } from "@/lib/challenge-timer";
import {
  DS_COLORS,
  DS_SPACING,
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_SHADOWS,
} from "@/lib/design-system";
import { GRIITWordmark, InitialCircle } from "@/src/components/ui";
import ViewShot from "react-native-view-shot";
import { ShareCard } from "@/components/ShareCard";
import { shareProgressImage, shareDaySecured } from "@/lib/share";
import { Image } from "expo-image";

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
  const { colors: themeColors } = useTheme();
  return (
    <View style={[syncingBannerStyles.wrap, { backgroundColor: themeColors.warningLight }]}>
      <RefreshCw size={14} color={themeColors.accent} />
      <Text style={[syncingBannerStyles.text, { color: themeColors.text.primary }]} numberOfLines={1}>
        Syncing... we{"'"}ll update when you{"'"}re back online.
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={12}
          style={syncingBannerStyles.dismiss}
          accessibilityLabel="Dismiss syncing banner"
          accessibilityRole="button"
        >
          <Text style={syncingBannerStyles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AnimatedProgressBar({ progress, color, trackBg }: { progress: number; color: string; trackBg?: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const bg = trackBg ?? DS_COLORS.chipFill;

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
          { backgroundColor: DS_COLORS.success, opacity: pulseOpacity, borderRadius: 10 },
        ]}
        pointerEvents="none"
      />
      <Animated.View style={{ transform: [{ scale: checkScale }] }}>
        <CheckCircle2
          size={20}
          color={completed ? DS_COLORS.success : DS_COLORS.border}
          fill={completed ? DS_COLORS.success : "transparent"}
          strokeWidth={completed ? 0 : 1.5}
        />
      </Animated.View>
      <Text
        style={[
          taskStyles.title,
          { color: DS_COLORS.textPrimary },
          completed && { color: DS_COLORS.textMuted },
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
  const { colors } = useTheme();
  const challengeTitle = (challenge as { title?: string })?.title ?? (activeChallenge as { challenges?: { title?: string } })?.challenges?.title;
  const currentDayIndex = (activeChallenge as { current_day_index?: number })?.current_day_index ?? 1;
  const durationDays = (challenge as { duration_days?: number })?.duration_days ?? (activeChallenge as { challenges?: { duration_days?: number } })?.challenges?.duration_days;
  const dayLabel = durationDays ? `Day ${currentDayIndex} of ${durationDays}` : undefined;

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
  const appOpenedTrackedRef = useRef(false);
  const [syncingBannerDismissed, setSyncingBannerDismissed] = useState(false);
  const [showShareProgressModal, setShowShareProgressModal] = useState(false);
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);
  const shareCardRef = useRef<InstanceType<typeof ViewShot> | null>(null);
  const [secureError, setSecureError] = useState<string>('');
  const [freezeError, setFreezeError] = useState<string>('');
  const secureBtnScale = useRef(new Animated.Value(1)).current;
  const secureBtnGlow = useRef(new Animated.Value(0)).current;

  const weeklyProgressQuery = useQuery({
    queryKey: ["home", "weeklyProgress"],
    queryFn: () => trpcQuery(TRPC.profiles.getWeeklyProgress) as Promise<{ goal: number; completed: number; remaining: number }>,
    staleTime: 60 * 1000,
    enabled: !isGuest,
  });
  const weeklyProgress = weeklyProgressQuery.data ?? { goal: 5, completed: 0, remaining: 5 };
  const [showWeeklyGoalModal, setShowWeeklyGoalModal] = useState(false);

  const leaderboardQuery = useQuery({
    queryKey: ["home", "leaderboard"],
    queryFn: () => trpcQuery(TRPC.leaderboard.getWeekly, {}) as Promise<{ currentUserRank: number | null; totalSecuredToday: number; entries?: unknown[] }>,
    staleTime: 60 * 1000, // 1 min — leaderboard changes often
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
    staleTime: 30 * 1000, // 30 sec — activity feed is fast-changing
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
      const data = (await trpcQuery(TRPC.challenges.getFeatured, { limit: 3 })) as { items?: { id: string; title?: string; description?: string }[] } | { id: string; title?: string }[];
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
      const data = (await trpcQuery(TRPC.challenges.getFeatured, { limit: 6 })) as { items?: { id: string; title?: string; description?: string; short_hook?: string }[] } | { id: string; title?: string; short_hook?: string }[];
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
  const { isPremium, requirePremium } = useSubscription();
  const lastStandRequiresPremium = (stats as StatsFromApi)?.lastStandRequiresPremium ?? false;
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

  useEffect(() => {
    if (!isGuest && initialFetchDone && !appOpenedTrackedRef.current) {
      appOpenedTrackedRef.current = true;
      track({ name: "app_opened", streak_count: currentStreak, isPremium });
    }
  }, [isGuest, initialFetchDone, currentStreak, isPremium]);

  const tasks = useMemo((): { id: string; title: string; completed: boolean }[] => {
    if (!challenge?.challenge_tasks) return [];
    return (challenge.challenge_tasks as ChallengeTaskFromApi[]).map((t) => ({
      id: t.id,
      title: t.title ?? t.type,
      completed: todayCheckins.some((c) => c.task_id === t.id && c.status === "completed"),
    }));
  }, [challenge?.challenge_tasks, todayCheckins]);

  const progressColor = daySecured
    ? DS_COLORS.success
    : computeProgress.progress >= 50
    ? DS_COLORS.accent
    : DS_COLORS.textMuted;

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
    setSecureError('');
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
        setSecureError("Couldn't secure day. Try again.");
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
      const totalDaysNum = result.totalDays ?? challenge?.duration_days ?? 0;
      const challengeTitle = result.challengeName ?? (challenge as { title?: string })?.title ?? (activeChallenge as { challenges?: { title?: string } })?.challenges?.title ?? "";
      const isCompletion = result.challengeCompleted === true;
      setTimeout(() => {
        setOptimisticDaySecured(false);
        if (isCompletion) {
          const totalDaysSecuredNow = (stats as StatsFromApi)?.totalDaysSecured != null ? ((stats as StatsFromApi)?.totalDaysSecured ?? 0) + 1 : totalDaysNum;
          router.push({
            pathname: ROUTES.CHALLENGE_COMPLETE,
            params: {
              challengeName: String(challengeTitle || "Challenge"),
              totalDays: String(totalDaysNum),
              streakCount: streak.toString(),
              tier: tierName ?? undefined,
              totalDaysSecured: String(totalDaysSecuredNow),
            },
          } as never);
        } else {
          const challengeIdForNav =
            (challenge as { id?: string })?.id ??
            (activeChallenge as { challenges?: { id?: string } })?.challenges?.id ??
            "";
          router.push({
            pathname: ROUTES.SECURE_CONFIRMATION,
            params: {
              day: currentDay.toString(),
              streak: streak.toString(),
              totalDays: String(totalDaysNum),
              isHardMode: (challenge?.difficulty === "hard" || challenge?.difficulty === "extreme").toString(),
              challengeName: String(challengeTitle || ""),
              ...(challengeIdForNav ? { challengeId: challengeIdForNav } : {}),
            },
          } as never);
          const totalDaysSecuredNow = (stats as StatsFromApi)?.totalDaysSecured != null ? ((stats as StatsFromApi)?.totalDaysSecured ?? 0) + 1 : 0;
          maybePromptForReview(totalDaysSecuredNow, "day_secured").catch(() => {});
          if (Platform.OS !== "web" && totalDaysSecuredNow === 1) {
            const key = "griit_notification_prompt_post_first_shown";
            Notifications.getPermissionsAsync().then(({ status }) => {
              if (status !== "undetermined") return;
              AsyncStorage.getItem(key).then((shown) => {
                if (shown === "true") return;
                AsyncStorage.setItem(key, "true");
                track({ name: "notification_permission_deferred_to_post_first_day" });
                Alert.alert(
                  "Want reminders to keep your streak alive?",
                  "We'll notify you when it's time to secure your day.",
                  [
                    { text: "Not now", style: "cancel" },
                    {
                      text: "Enable",
                      onPress: () => {
                        requestNotificationPermissions().then((ok) => {
                          if (ok) registerPushTokenWithBackend().catch(() => {});
                        });
                      },
                    },
                  ]
                );
              });
            });
          }
        }
      }, 1200);
    } catch {
      setOptimisticDaySecured(false);
      setShowCelebration(false);
      setCelebrationPayload(null);
      setSecureError("Couldn't secure day. Try again.");
    }
  }, [secureDay, secureBtnScale, activeChallenge, stats, challenge, router, daysSinceLastSecure, leaderboardQuery, homeActiveQuery]);

  if (!isGuest && isLoading && !initialFetchDone) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <HomeScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.guestScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji} accessibilityRole="header">🔥</Text>
            <Text style={[styles.heroTitle, { color: colors.text.primary }]}>Your discipline journey{'\n'}starts here.</Text>
            <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>
              Join thousands building better habits.{'\n'}
              One day at a time. No excuses.
            </Text>
            <TouchableOpacity
              style={[styles.heroCTA, { backgroundColor: colors.accent }]}
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              activeOpacity={0.85}
              accessibilityLabel="Explore challenges"
              accessibilityRole="button"
            >
              <Text style={styles.heroCTAText}>Explore challenges</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.motivationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.motivationQuote, { color: colors.text.secondary }]}>
              {`"${guestQuote.text}"`}
            </Text>
            <Text style={[styles.motivationAuthor, { color: colors.text.muted }]}>{guestQuote.author}</Text>
          </View>
          <View style={styles.howItWorks}>
            <Text style={[styles.guestSectionTitle, { color: colors.text.primary }]}>How GRIIT works</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>🎯</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Pick a challenge</Text>
                <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>Choose from 7-day sprints to 75-day transformations</Text>
              </View>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>✅</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Complete daily tasks</Text>
                <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>Workouts, journaling, cold showers — you decide</Text>
              </View>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepEmoji}>🔒</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Secure your day</Text>
                <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>Lock in your progress. Build your streak. Earn your rank.</Text>
              </View>
            </View>
          </View>
          <View style={styles.guestFeaturedSection}>
            <Text style={[styles.guestSectionTitle, { color: colors.text.primary }]}>Popular challenges</Text>
            {(guestFeatured as { id: string; title?: string; short_hook?: string }[]).map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.guestChallengeCard, styles.yourPositionCard]}
                onPress={() => router.push(ROUTES.CHALLENGE_ID(challenge.id) as never)}
                activeOpacity={0.8}
                accessibilityLabel={`Open challenge: ${challenge.title ?? "Challenge"}`}
                accessibilityRole="button"
              >
                <Text style={[styles.guestChallengeTitle, { color: colors.text.primary }]} numberOfLines={1}>{challenge.title ?? "Challenge"}</Text>
                {challenge.short_hook ? <Text style={[styles.guestChallengeHook, { color: colors.text.secondary }]} numberOfLines={1}>{challenge.short_hook}</Text> : null}
                <ChevronRight size={18} color={colors.text.muted} style={{ position: "absolute", right: 12, top: 18 }} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              activeOpacity={0.8}
              accessibilityLabel="See all challenges"
              accessibilityRole="button"
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>See all challenges →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.socialProof}>
            <Text style={[styles.socialProofText, { color: colors.text.secondary }]}>🔥 Join the movement. Every day counts.</Text>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
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
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {isError && !syncingBannerDismissed && (
          <SyncingBanner onDismiss={() => setSyncingBannerDismissed(true)} />
        )}

        <View style={styles.header}>
          <GRIITWordmark spaced={!isGuest} subtitle={isGuest ? undefined : "Build Discipline Daily"} compact={!!isGuest} />
          {!isGuest && (
            <View style={styles.headerBadges}>
              <View style={[styles.headerBadgePill, { backgroundColor: "#F5F3F0" }]} accessibilityLabel={`Score: ${stats?.longestStreak ?? 0}`} accessibilityRole="text">
                <TrendingUp size={14} color={DS_COLORS.textSecondary} />
                <Text style={[styles.headerBadgePillText, { color: DS_COLORS.textPrimary }]}>{stats?.longestStreak ?? 0}</Text>
              </View>
              <View style={[styles.headerBadgePill, { backgroundColor: "#F5F3F0" }]} accessibilityLabel={`Streak: ${currentStreak} days`} accessibilityRole="text">
                <Flame size={14} color={DS_COLORS.accent} />
                <Text style={[styles.headerBadgePillText, { color: DS_COLORS.textPrimary }]}>{currentStreak}</Text>
              </View>
            </View>
          )}
        </View>

        {!isGuest && !hasActiveChallenge && (
          <View style={[styles.welcomeCard, { backgroundColor: DS_COLORS.accentLight, borderColor: DS_COLORS.accent, borderWidth: 2, borderStyle: "dashed" }]}>
            <RefreshCw size={24} color={DS_COLORS.accent} style={{ marginBottom: 8 }} />
            <Text style={styles.welcomeCardTitle}>
              {((stats?.totalDaysSecured ?? 0) > 0 ? "Welcome back." : "Start your first challenge.")}
            </Text>
            <Text style={styles.welcomeCardSub}>
              {((stats?.totalDaysSecured ?? 0) > 0
                ? "Secure 1 day today to restart momentum."
                : "Pick a challenge, commit, and secure your first day.")}
            </Text>
            <TouchableOpacity
              style={[styles.welcomeCardButton, { backgroundColor: DS_COLORS.accent }]}
              onPress={() => requireAuth("join", () => router.push(ROUTES.TABS_DISCOVER as never))}
              activeOpacity={0.85}
              accessibilityLabel={(stats?.totalDaysSecured ?? 0) > 0 ? "Pick a Challenge" : "Find a challenge"}
              accessibilityRole="button"
            >
              <Text style={styles.welcomeCardButtonText}>{(stats?.totalDaysSecured ?? 0) > 0 ? "Pick a Challenge" : "Find a challenge"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isGuest && hasActiveChallenge && !isDaySecured && (
          <View style={styles.mainPromptBlock}>
            <Text style={[styles.secureTodayTitle, { color: colors.text.primary }]} accessibilityRole="header">Secure today to protect your streak.</Text>
            <Text style={[styles.secureTodaySub, { color: DS_COLORS.accent }]}>
              {(() => {
                const ac = activeChallenge as { ends_at?: string } | undefined;
                if (ac?.ends_at) return `${formatTimeRemaining(ac.ends_at)} remaining.`;
                const { hours, minutes } = getTimeUntilMidnight();
                return `${hours}h ${minutes}m remaining.`;
              })()}
            </Text>
            <View style={[styles.metricsCard, { backgroundColor: SURFACE_SUBTLE }]}>
              {nextTierName != null && pointsToNextTier > 0 && (
                <View style={styles.metricsRow}>
                  <Flame size={18} color={colors.text.secondary} />
                  <Text style={[styles.metricsText, { color: colors.text.secondary }]}>{pointsToNextTier} pts to {nextTierName}</Text>
                </View>
              )}
              {leaderboardData != null && (
                <View style={styles.metricsRow}>
                  <Users size={18} color={colors.text.secondary} />
                  <Text style={[styles.metricsText, { color: colors.text.secondary }]}>
                    {leaderboardData.totalSecuredToday} friends secured today
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {!isGuest && hasActiveChallenge && tasks.length > 0 && (
              <View style={styles.todaysResetCard}>
                <View style={styles.todaysResetHeader}>
                  <Clock size={18} color={colors.text.primary} />
                  <Text style={[styles.todaysResetTitle, { color: colors.text.primary }]}>Today&apos;s Reset</Text>
                  <Text style={[styles.todaysResetTime, { color: colors.text.muted }]}>
                    {(() => {
                      const ac = activeChallenge as { ends_at?: string } | undefined;
                      if (ac?.ends_at) return formatTimeRemaining(ac.ends_at) + " left";
                      const { hours, minutes } = getTimeUntilMidnight();
                      return `${hours}h ${minutes}m left`;
                    })()}
                  </Text>
                </View>
                <View style={[styles.todaysResetDivider, { backgroundColor: colors.border }]} />
                <View style={styles.todaysResetTaskList}>
                  {tasks.map((task) => (
                    <View key={task.id} style={styles.todaysResetTaskRow}>
                      <Circle size={18} color={colors.border} strokeWidth={2} />
                      <Text style={[styles.todaysResetTaskText, { color: colors.text.primary }, task.completed && styles.todaysResetTaskDone]}>{task.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

        {!isGuest && (
          <View style={[styles.statsRowCard, { backgroundColor: SURFACE_SUBTLE }]}>
            <View style={styles.statsRowCol}>
              <Flame size={20} color={DS_COLORS.accent} />
              <Text style={styles.statsRowNum}>{currentStreak}</Text>
              <Text style={styles.statsRowLabel}>STREAK</Text>
            </View>
            <View style={[styles.statsRowDivider, { backgroundColor: DS_COLORS.border }]} />
            <View style={styles.statsRowCol}>
              <TrendingUp size={20} color={DS_COLORS.textPrimary} />
              <Text style={styles.statsRowNum}>{stats?.longestStreak ?? 0}</Text>
              <Text style={styles.statsRowLabel}>SCORE</Text>
            </View>
            <View style={[styles.statsRowDivider, { backgroundColor: DS_COLORS.border }]} />
            <View style={styles.statsRowCol}>
              <View style={[styles.statsRowDot, { backgroundColor: DS_COLORS.accent }]} />
              <Text style={styles.statsRowNum}>{tierName ?? "—"}</Text>
              <Text style={styles.statsRowLabel}>RANK</Text>
            </View>
          </View>
        )}

        {!isGuest && (
          <View style={styles.disciplineWeekCard}>
            <View style={[styles.disciplineWeekIconWrap, { backgroundColor: DS_COLORS.successSoft }]}>
              <TrendingUp size={20} color={colors.success} />
            </View>
            <View style={styles.disciplineWeekBody}>
              <Text style={[styles.disciplineWeekTitle, { color: colors.text.primary }]}>
                <Text style={[styles.disciplineWeekNum, { color: colors.success }]}>+{stats?.longestStreak ?? 0}</Text> Discipline this week
              </Text>
              <Text style={[styles.disciplineWeekSub, { color: colors.success }]}>+100% from last week</Text>
            </View>
          </View>
        )}

        {!hasActiveChallenge && (suggestedChallenges.length > 0 || MOCK_SUGGESTED.length > 0) && (
          <View style={styles.suggestedChallengesSection}>
            <Text style={[styles.suggestedChallengesTitle, { color: DS_COLORS.textMuted, letterSpacing: 1, fontSize: 12, fontWeight: "600" }]}>SUGGESTED FOR YOU</Text>
            {(suggestedChallenges.length > 0 ? suggestedChallenges.slice(0, 3) : MOCK_SUGGESTED).map((c: { id: string; title?: string }) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.suggestedChallengeRow, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  requireAuth("join", () => router.push(ROUTES.CHALLENGE_ID(c.id) as never));
                }}
                activeOpacity={0.85}
                accessibilityLabel={`Open challenge: ${c.title ?? "Challenge"}`}
                accessibilityRole="button"
              >
                <Text style={[styles.suggestedChallengeTitle, { color: DS_COLORS.textPrimary }]} numberOfLines={1}>{c.title ?? "Challenge"}</Text>
                <ChevronRight size={18} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.liveSectionHeader}>
          <View style={[styles.liveDot, { backgroundColor: DS_COLORS.danger }]} />
          <Text style={[styles.liveTitle, { color: DS_COLORS.textPrimary }]}>LIVE</Text>
          <Text style={[styles.liveSubItalic, { color: DS_COLORS.textMuted }]}>People are moving</Text>
        </View>

        {(() => {
          const feedItems = liveFeedItems.length > 0 ? liveFeedItems : (MOCK_FEED as unknown as LiveFeedCardData[]);
          if (feedItems.length > 0) {
            return feedItems.map((item: MockFeedItem | LiveFeedCardData, i: number) => {
              const key = `${(item as MockFeedItem).type ?? (item as LiveFeedCardData).type}-${i}`;
              if ("type" in item && item.type === "secured") {
                const s = item as Extract<MockFeedItem, { type: "secured" }>;
                return (
                  <View key={key} style={[styles.liveFeedCard, { backgroundColor: DS_COLORS.surface, borderColor: DS_COLORS.border }]}>
                    <InitialCircle username={s.user} size={44} />
                    <View style={styles.liveFeedBody}>
                      <Text style={[styles.liveFeedText, { color: DS_COLORS.textPrimary }]}><Text style={styles.liveFeedBold}>{s.user}</Text> secured Day {s.day} of {s.challenge}</Text>
                      <Text style={[styles.liveFeedMeta, { color: DS_COLORS.accent }]}>🔥 Streak: {s.streak} days</Text>
                      <Text style={[styles.liveFeedTime, { color: DS_COLORS.textMuted }]}>{s.timeAgo}</Text>
                      <View style={styles.liveFeedPills}>
                        {/* TODO: Wire to API when respect/chase endpoints exist */}
                        <TouchableOpacity style={[styles.liveFeedPill, { opacity: 0.6 }]} onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert("Coming Soon", "Respect & Chase will be available in a future update!"); }}>
                          <Text style={styles.liveFeedPillText}>Respect {s.respect}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.liveFeedPill, { opacity: 0.6 }]} onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert("Coming Soon", "Respect & Chase will be available in a future update!"); }}>
                          <Text style={styles.liveFeedPillText}>Chase</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }
              if ("type" in item && item.type === "milestone") {
                const m = item as Extract<MockFeedItem, { type: "milestone" }>;
                return (
                  <View key={key} style={[styles.liveFeedCard, { backgroundColor: DS_COLORS.surface, borderLeftWidth: 3, borderLeftColor: DS_COLORS.gold }]}>
                    <View style={[styles.liveFeedIconCircle, { backgroundColor: "#FFF8E1" }]}><Trophy size={20} color={DS_COLORS.gold} /></View>
                    <View style={styles.liveFeedBody}>
                      <Text style={[styles.liveFeedText, { color: DS_COLORS.textPrimary }]}>Hit <Text style={[styles.liveFeedBold, { color: DS_COLORS.accent }]}>{m.days} days</Text> straight</Text>
                      <Text style={[styles.liveFeedMeta, { color: DS_COLORS.textMuted }]}>Top {m.topPercent}% this week</Text>
                      {/* TODO: Wire to API when respect/chase endpoints exist */}
                      <TouchableOpacity style={[styles.liveFeedPill, { opacity: 0.6 }]} onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert("Coming Soon", "Respect & Chase will be available in a future update!"); }}>
                        <Text style={styles.liveFeedPillText}>Respect {m.respect}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
              if ("type" in item && item.type === "challenge_cta") {
                const c = item as Extract<MockFeedItem, { type: "challenge_cta" }>;
                const challengeId = "challengeId" in c ? (c as { challengeId?: string }).challengeId : undefined;
                return (
                  <View key={key} style={[styles.liveFeedCard, { backgroundColor: DS_COLORS.surface, borderColor: DS_COLORS.border }]}>
                    <View style={[styles.liveFeedIconCircle, { backgroundColor: DS_COLORS.accentLight }]}><Zap size={20} color={DS_COLORS.accent} /></View>
                    <View style={styles.liveFeedBody}>
                      <Text style={[styles.liveFeedText, { color: DS_COLORS.textPrimary }]}><Text style={styles.liveFeedBold}>{c.percent}%</Text> of participants secured today</Text>
                      <Text style={[styles.liveFeedMeta, { color: DS_COLORS.textMuted }]}>in {c.challenge}</Text>
                      <Text style={[styles.liveFeedMeta, { color: DS_COLORS.accent, fontWeight: "600" }]}>Are you in?</Text>
                      <TouchableOpacity
                        style={[styles.liveFeedCtaButton, { backgroundColor: DS_COLORS.accent }]}
                        onPress={() => {
                          if (challengeId) router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
                          else router.push(ROUTES.TABS_DISCOVER as never);
                        }}
                      >
                        <Text style={styles.liveFeedCtaButtonText}>{challengeId ? "View Challenge >" : "Open Challenge >"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
              if ("type" in item && item.type === "rank_up") {
                const r = item as Extract<MockFeedItem, { type: "rank_up" }>;
                return (
                  <View key={key} style={[styles.liveFeedCard, { backgroundColor: DS_COLORS.surface, borderLeftWidth: 3, borderLeftColor: DS_COLORS.accent }]}>
                    <InitialCircle username={r.user} size={44} />
                    <View style={styles.liveFeedBody}>
                      <Text style={[styles.liveFeedText, { color: DS_COLORS.textPrimary }]}><Text style={styles.liveFeedBold}>{r.user}</Text> moved to Rank &apos;<Text style={{ color: DS_COLORS.success, fontWeight: "700" }}>{r.newRank}</Text>&apos;</Text>
                      <Text style={[styles.liveFeedMeta, { color: DS_COLORS.success }]}>📈 +{r.discipline} Discipline this week</Text>
                      <TouchableOpacity onPress={() => router.push(ROUTES.PROFILE_USERNAME(r.user) as never)}><Text style={[styles.liveFeedPillText, { color: DS_COLORS.accent }]}>View Profile ></Text></TouchableOpacity>
                    </View>
                  </View>
                );
              }
              return <LiveFeedCard key={key} data={item as LiveFeedCardData} />;
            });
          }
          if (liveFeedQuery.isLoading) {
            return (
              <View style={[styles.liveFeedEmpty, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
                <Text style={[styles.liveFeedEmptySub, { color: DS_COLORS.textMuted }]}>Loading activity…</Text>
              </View>
            );
          }
          return (
            <View style={[styles.liveFeedEmpty, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
              <Users size={32} color={colors.text.muted} style={{ marginBottom: 8 }} />
              <Text style={[styles.liveFeedEmptyTitle, { color: DS_COLORS.textPrimary }]}>No activity yet</Text>
              <Text style={[styles.liveFeedEmptySub, { color: DS_COLORS.textMuted }]}>Join a challenge to see the community in action.</Text>
            </View>
          );
        })()}

        {!isGuest && leaderboardError ? (
          <View style={styles.yourPositionCard}>
            <AlertTriangle size={28} color={colors.text.muted} />
            <Text style={[styles.yourPositionLabel, { color: DS_COLORS.textMuted }]}>LEADERBOARD</Text>
            <Text style={[styles.yourPositionText, { color: DS_COLORS.textPrimary }]}>Couldn&apos;t load leaderboard. Check your connection and try again.</Text>
            <TouchableOpacity
              style={[styles.secureNowButton, { backgroundColor: DS_COLORS.accent }]}
              onPress={() => leaderboardQuery.refetch()}
              activeOpacity={0.85}
              accessibilityLabel="Retry loading leaderboard"
              accessibilityRole="button"
            >
              <RefreshCw size={18} color={DS_COLORS.white} />
              <Text style={styles.secureNowButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !isGuest && leaderboardLoading && leaderboardData == null ? (
          <View style={styles.yourPositionCard}>
            <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 8 }} />
            <Text style={[styles.yourPositionText, { color: DS_COLORS.textPrimary }]}>Loading leaderboard…</Text>
          </View>
        ) : leaderboardData?.currentUserRank != null ? (
          <View style={[styles.yourPositionCard, styles.yourPositionCardAccent]}>
            <Target size={28} color={colors.accent} />
            <Text style={[styles.yourPositionLabel, { color: DS_COLORS.textMuted }]}>YOUR POSITION</Text>
            <Text style={[styles.yourPositionText, { color: DS_COLORS.textPrimary }]}>You are ranked <Text style={styles.feedBold}>#{leaderboardData.currentUserRank}</Text> among friends this week.</Text>
            <Text style={[styles.yourPositionSub, { color: DS_COLORS.textSecondary }]}>You&apos;re <Text style={[styles.feedBold, { color: DS_COLORS.accent }]}>{Math.max(0, (stats?.longestStreak ?? 0) - currentStreak)} days</Text> away from your best streak.</Text>
            <TouchableOpacity
              style={[styles.secureNowButton, { backgroundColor: DS_COLORS.accent }]}
              onPress={() => requireAuth("secure", () => router.push(ROUTES.TABS_DISCOVER as never))}
              activeOpacity={0.85}
              accessibilityLabel="Secure your day"
              accessibilityRole="button"
            >
              <Shield size={18} color={DS_COLORS.white} />
              <Text style={styles.secureNowButtonText}>Secure Now</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.footerTagline}>Only discipline shows here.</Text>
      </ScrollView>

      {showMilestone != null && (() => {
        const milestoneConfig = getMilestoneForStreak(showMilestone);
        const title = milestoneConfig?.title ?? `${showMilestone}-Day Streak`;
        const subtitle = milestoneConfig?.subtitle ?? "You are building discipline.";
        const onDismissMilestone = () => {
          const total = (stats as StatsFromApi)?.totalDaysSecured ?? 0;
          maybePromptForReview(total, "milestone").catch(() => {});
          setShowMilestone(null);
        };
        return (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={onDismissMilestone}
            accessibilityLabel="Dismiss milestone"
            accessibilityRole="button"
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: DS_COLORS.card }]}>
              <Text style={[styles.freezeModalTitle, { color: DS_COLORS.textPrimary }]}>{title}</Text>
              <Text style={[styles.freezeModalSub, { color: DS_COLORS.textSecondary }]}>{subtitle}</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { marginBottom: 8, backgroundColor: DS_COLORS.accent }]}
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
                  onDismissMilestone();
                }}
                activeOpacity={0.85}
                accessibilityLabel="Share milestone"
                accessibilityRole="button"
              >
                <Text style={styles.freezeModalConfirmText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.freezeModalCancel, { borderColor: DS_COLORS.border }]}
                onPress={onDismissMilestone}
                activeOpacity={0.85}
                accessibilityLabel="Dismiss"
                accessibilityRole="button"
              >
                <Text style={[styles.freezeModalCancelText, { color: DS_COLORS.textPrimary }]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        );
      })()}

      {showWeeklyGoalModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={() => setShowWeeklyGoalModal(false)}
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.freezeModalTitle, { color: colors.text.primary }]}>Weekly goal</Text>
              <Text style={[styles.freezeModalSub, { color: colors.text.secondary }]}>How many days do you want to secure per week?</Text>
              {([3, 5, 7] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.weeklyGoalOption,
                    { borderColor: colors.border },
                    weeklyProgress.goal === g && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                  ]}
                  onPress={async () => {
                    const oldGoal = weeklyProgress.goal;
                    if (oldGoal === g) { setShowWeeklyGoalModal(false); return; }
                    try {
                      await trpcMutate(TRPC.profiles.setWeeklyGoal, { goal: g });
                      track({ name: "weekly_goal_changed", old_goal: oldGoal, new_goal: g });
                      weeklyProgressQuery.refetch();
                      setShowWeeklyGoalModal(false);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <Text style={[styles.weeklyGoalOptionText, { color: colors.text.primary }]}>
                    {g === 3 ? "Casual (3 days)" : g === 5 ? "Regular (5 days)" : "Committed (7 days)"}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.freezeModalCancel, { borderColor: colors.border, marginTop: 12 }]}
                onPress={() => setShowWeeklyGoalModal(false)}
              >
                <Text style={[styles.freezeModalCancelText, { color: colors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showShareProgressModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={() => setShowShareProgressModal(false)}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: DS_COLORS.card, padding: 24 }]}>
              <Text style={[styles.freezeModalTitle, { color: DS_COLORS.textPrimary, marginBottom: 16 }]}>Share your progress</Text>
              <ViewShot
                ref={shareCardRef}
                options={{ format: "png", result: "tmpfile", width: 400, height: 500 }}
                style={{ alignItems: "center", marginBottom: 16 }}
              >
                <ShareCard
                  streakCount={currentStreak}
                  challengeName={challengeTitle}
                  dayLabel={dayLabel}
                  tier={tierName ?? undefined}
                />
              </ViewShot>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { backgroundColor: DS_COLORS.accent }]}
                onPress={async () => {
                  try {
                    const uri = await shareCardRef.current?.capture?.();
                    const message = `Day secured. ${currentStreak}-day streak on GRIIT. Join me — griit.app`;
                    if (uri) {
                      await shareProgressImage(uri, message);
                    } else {
                      await shareDaySecured({ streak: currentStreak, challengeName: challengeTitle, dayNumber: currentDayIndex });
                    }
                  } catch {
                    await shareDaySecured({ streak: currentStreak, challengeName: challengeTitle, dayNumber: currentDayIndex });
                  }
                  setShowShareProgressModal(false);
                }}
                activeOpacity={0.85}
                accessibilityLabel="Share"
                accessibilityRole="button"
              >
                <Text style={styles.freezeModalConfirmText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.freezeModalCancel, { borderColor: DS_COLORS.border, marginTop: 8 }]}
                onPress={() => setShowShareProgressModal(false)}
                activeOpacity={0.85}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={[styles.freezeModalCancelText, { color: DS_COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showFreezeModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={() => !freezeSubmitting && setShowFreezeModal(false)}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: DS_COLORS.card }]}>
              <Text style={[styles.freezeModalTitle, { color: DS_COLORS.textPrimary }]}>Use your streak freeze?</Text>
              <Text style={[styles.freezeModalSub, { color: DS_COLORS.textSecondary }]}>
                This will save your streak. You get 1 free freeze per month.{freezesRemaining !== undefined && freezesRemaining >= 0 ? ` (${freezesRemaining} left this month)` : ""}
              </Text>
              {freezeError ? (
                <Text
                  style={{ color: DS_COLORS.errorText, fontSize: 13, marginTop: 6, textAlign: 'center' }}
                  accessibilityLiveRegion="polite"
                >
                  {freezeError}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { backgroundColor: DS_COLORS.accent }, freezeSubmitting && styles.freezeModalConfirmDisabled]}
                disabled={freezeSubmitting}
                onPress={async () => {
                  track({ name: "streak_freeze_used" });
                  setFreezeError('');
                  setFreezeSubmitting(true);
                  try {
                    await trpcMutate(TRPC.streaks.useFreeze, { dateKeyToFreeze: yesterdayKey });
                    await refetchAll();
                    setShowFreezeModal(false);
                  } catch (e: unknown) {
                    setFreezeError(e instanceof Error ? e.message : "Could not use freeze.");
                  } finally {
                    setFreezeSubmitting(false);
                  }
                }}
                activeOpacity={0.85}
                accessibilityLabel="Use streak freeze"
                accessibilityRole="button"
                accessibilityState={{ disabled: freezeSubmitting }}
              >
                <Text style={styles.freezeModalConfirmText}>{freezeSubmitting ? "..." : "Use freeze"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.freezeModalCancel, { borderColor: DS_COLORS.border }]}
                onPress={() => setShowFreezeModal(false)}
                disabled={freezeSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
                accessibilityState={{ disabled: freezeSubmitting }}
              >
                <Text style={[styles.freezeModalCancelText, { color: DS_COLORS.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showLastStandUsedModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={() => setShowLastStandUsedModal(false)}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.freezeModalCard, { backgroundColor: DS_COLORS.card }]}>
              <Text style={[styles.freezeModalTitle, { color: DS_COLORS.textPrimary }]}>Last Stand used.</Text>
              <Text style={[styles.freezeModalSub, { color: DS_COLORS.textSecondary }]}>Streak preserved.</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { backgroundColor: DS_COLORS.accent }]}
                onPress={() => setShowLastStandUsedModal(false)}
                activeOpacity={0.85}
                accessibilityLabel="Dismiss"
                accessibilityRole="button"
              >
                <Text style={styles.freezeModalConfirmText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showStreakLostModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={[styles.freezeModalBackdrop, { backgroundColor: DS_COLORS.modalBackdrop }]}
            activeOpacity={1}
            onPress={() => setShowStreakLostModal(false)}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          />
          <View style={styles.freezeModalCenter}>
            <View style={[styles.streakLostCard, { backgroundColor: DS_COLORS.surface }]}>
              <TouchableOpacity
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.streakLostClose}
                onPress={() => setShowStreakLostModal(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={[styles.streakLostCloseText, { color: DS_COLORS.textSecondary }]}>✕</Text>
              </TouchableOpacity>
              <View style={[styles.streakLostIconWrap, { backgroundColor: DS_COLORS.surfaceMuted }]}>
                <Flame size={28} color={DS_COLORS.textMuted} />
              </View>
              <Text style={[styles.streakLostTitle, { color: DS_COLORS.textPrimary }]}>Streak lost.</Text>
              <Text style={[styles.streakLostSub, { color: DS_COLORS.textSecondary }]}>Start again today.</Text>
              <TouchableOpacity
                style={[styles.streakLostButton, { backgroundColor: DS_COLORS.commitmentButtonBg }]}
                onPress={() => setShowStreakLostModal(false)}
                activeOpacity={0.85}
                accessibilityLabel="Continue"
                accessibilityRole="button"
              >
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
    paddingHorizontal: 20,
    paddingBottom: DS_SPACING.section,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DS_COLORS.black,
  },
  headerBadgePill: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  headerBadgePillText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
  },
  statsRowCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  statsRowCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statsRowNum: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
  },
  statsRowLabel: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statsRowDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 4,
  },
  statsRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  welcomeCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  welcomeCardTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  welcomeCardSub: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: DS_COLORS.textMuted,
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeCardButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  welcomeCardButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  tierProgressSection: {
    marginBottom: DS_SPACING.lg,
  },
  tierProgressTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 4,
    lineHeight: 30,
  },
  tierProgressSub: {
    fontSize: 14,
    fontWeight: "400" as const,
    marginBottom: 12,
  },
  tierProgressCard: {
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.cardPadding,
    gap: 12,
    borderWidth: 1,
  },
  mainPromptBlock: {
    marginBottom: 16,
  },
  secureTodayTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 28,
  },
  secureTodaySub: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: 16,
  },
  metricsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
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
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.cardPadding + 2,
    marginBottom: DS_SPACING.sectionGap,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    ...DS_SHADOWS.card,
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
  weeklyGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    marginBottom: DS_SPACING.sm,
    borderRadius: DS_RADIUS.card,
    borderWidth: 1,
  },
  weeklyGoalLabel: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600" as const,
  },
  weeklyGoalValue: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600" as const,
  },
  weeklyGoalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  weeklyGoalOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
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
    padding: 16,
    marginBottom: DS_SPACING.sectionGap,
    borderRadius: 16,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  disciplineWeekIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  disciplineWeekBody: { flex: 1 },
  disciplineWeekTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  disciplineWeekNum: { fontWeight: "700", color: DS_COLORS.success },
  disciplineWeekSub: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.success,
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
    backgroundColor: DS_COLORS.danger,
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
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    flex: 1,
  },
  liveSubItalic: {
    fontSize: 13,
    fontStyle: "italic",
    flex: 1,
    textAlign: "right",
    color: DS_COLORS.textMuted,
  },
  liveFeedCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: DS_SPACING.cardPadding,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  liveFeedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  initialCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialCircleText: {
    color: DS_COLORS.white,
    fontWeight: "700",
  },
  liveFeedBody: {
    flex: 1,
  },
  liveFeedText: {
    fontSize: 15,
    marginBottom: 2,
  },
  liveFeedBold: {
    fontWeight: "700",
  },
  liveFeedMeta: {
    fontSize: 13,
    marginBottom: 2,
  },
  liveFeedTime: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    marginBottom: 8,
  },
  liveFeedPills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  liveFeedPill: {
    backgroundColor: "#F5F3F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0,
  },
  liveFeedPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  liveFeedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  liveFeedCtaButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: DS_RADIUS.button,
    marginTop: 8,
    alignItems: "center",
  },
  liveFeedCtaButtonText: {
    color: DS_COLORS.white,
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 16,
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
    marginBottom: 12,
    textAlign: "center",
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
    color: DS_COLORS.milestoneGold,
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
    backgroundColor: DS_COLORS.surfaceWarm,
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
    color: DS_COLORS.white,
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
  yourPositionCardAccent: {
    backgroundColor: DS_COLORS.accentLight,
    borderWidth: 2,
    borderColor: DS_COLORS.accent,
    padding: 24,
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
    color: DS_COLORS.white,
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    ...DS_SHADOWS.button,
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
    backgroundColor: DS_COLORS.accentSoft,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  modeTagText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: DS_COLORS.accent,
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    ...DS_SHADOWS.card,
  },
  challengeCardHard: {
    borderColor: DS_COLORS.accent,
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
    color: DS_COLORS.white,
  },
  firstSessionBanner: {
    backgroundColor: DS_COLORS.accentSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
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
    backgroundColor: DS_COLORS.warningSoft,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
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
  recoveryBannerLastStandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  upgradePromptCard: {
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginTop: DS_SPACING.md,
    padding: DS_SPACING.md,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: 1,
    position: "relative",
  },
  upgradePromptRow: { flexDirection: "row", alignItems: "center", paddingRight: 28 },
  upgradePromptTextWrap: { flex: 1 },
  upgradePromptTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  upgradePromptSub: { fontSize: 13 },
  upgradePromptDismiss: { position: "absolute", top: 8, right: 8, padding: 4 },
  upgradePromptDismissText: { fontSize: 18 },
  shareProgressButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  shareProgressButtonText: { fontSize: 14, fontWeight: "600" },
  leaderboardPreviewCard: {
    marginTop: DS_SPACING.lg,
    marginHorizontal: DS_SPACING.screenHorizontal,
    padding: DS_SPACING.cardPadding,
    borderRadius: DS_RADIUS.card,
    borderWidth: DS_BORDERS.width,
  },
  leaderboardPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  leaderboardPreviewTitle: { fontSize: 14, fontWeight: "700" },
  leaderboardPreviewRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  leaderboardPreviewItem: { flex: 1, alignItems: "center", minWidth: 0 },
  leaderboardPreviewAvatar: { width: 40, height: 40, borderRadius: 20, marginBottom: 4 },
  leaderboardPreviewName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  leaderboardPreviewScore: { fontSize: 12, fontWeight: "700" },
  leaderboardPreviewLink: { fontSize: 13, fontWeight: "600", marginTop: 10, textAlign: "center" },
  freezeCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: DS_COLORS.accent,
  },
  freezeCtaText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  freezeModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.modalBackdrop,
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
    color: DS_COLORS.white,
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
    borderRadius: 24,
    padding: 28,
    width: "80%",
    maxWidth: 340,
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
  },
  streakLostClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  streakLostCloseText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  streakLostIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DS_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  streakLostTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  streakLostSub: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  streakLostButton: {
    borderRadius: 14,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  streakLostButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
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
    backgroundColor: DS_COLORS.overlayDark,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 16,
    minWidth: 240,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
    letterSpacing: 0.2,
  },
  supportingText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textMuted,
    textAlign: "center",
  },
});
