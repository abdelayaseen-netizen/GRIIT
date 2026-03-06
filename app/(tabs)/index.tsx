import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Wifi,
  Flame,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Users,
  Circle,
  RefreshCw,
  ThumbsUp,
  UserPlus,
  AlertTriangle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import Colors from "@/constants/colors";
import StreakTracker from "@/components/StreakTracker";
import StreakCalendar from "@/components/StreakCalendar";
import { HomeScreenSkeleton } from "@/components/SkeletonLoader";
import Celebration from "@/components/Celebration";
import { RETENTION_CONFIG } from "@/lib/retention-config";
import { track } from "@/lib/analytics";
import { trpcMutate, trpcQuery } from "@/lib/trpc";

function getTimeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const ms = midnight.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

function SyncingBanner() {
  return (
    <View style={syncingBannerStyles.wrap}>
      <RefreshCw size={14} color={Colors.accent} />
      <Text style={syncingBannerStyles.text}>Syncing... we'll update when you're back online.</Text>
    </View>
  );
}

function CircularProgress({ size = 120, strokeWidth = 2, progress = 0 }: { size?: number; strokeWidth?: number; progress?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [progress, progressAnim]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  if (Platform.OS === 'web') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: Colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={styles.emptyProgressText}>Day 0</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: Colors.border,
        position: 'absolute',
      }} />
      <Text style={styles.emptyProgressText}>Day 0</Text>
    </View>
  );
}

function AnimatedProgressBar({ progress, color }: { progress: number; color: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

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
    <View style={progressStyles.track}>
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

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        taskStyles.row,
        {
          opacity: scaleAnim,
          transform: [{ translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: checkScale }] }}>
        <CheckCircle2
          size={20}
          color={completed ? Colors.streak.shield : Colors.border}
          fill={completed ? Colors.streak.shield : "transparent"}
          strokeWidth={completed ? 0 : 1.5}
        />
      </Animated.View>
      <Text
        style={[
          taskStyles.title,
          completed && taskStyles.titleCompleted,
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
  const { requireAuth } = useAuthGate();
  const isGuest = useIsGuest();
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
    profileLoading,
    todayCheckins,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showLastStandUsedModal, setShowLastStandUsedModal] = useState(false);
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{ currentUserRank: number | null; totalSecuredToday: number } | null>(null);
  const streakLostTrackedRef = useRef(false);
  const secureBtnScale = useRef(new Animated.Value(1)).current;
  const secureBtnGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trpcQuery("leaderboard.getWeekly").then((data: any) => {
      setLeaderboardData({
        currentUserRank: data?.currentUserRank ?? null,
        totalSecuredToday: data?.totalSecuredToday ?? 0,
      });
    }).catch(() => {});
  }, [isGuest, stats?.activeStreak]);

  const currentStreak = stats?.activeStreak || 0;
  const lastCompletedDateKey = (stats as any)?.lastCompletedDateKey ?? null;
  const todayKey = todayDateLocal;
  const yesterdayDate = new Date(todayKey);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = yesterdayDate.toISOString().split("T")[0];
  const effectiveMissedDays = (stats as any)?.effectiveMissedDays ?? (lastCompletedDateKey == null ? 0 : lastCompletedDateKey >= todayKey ? 0 : Math.floor((Date.parse(todayKey) - Date.parse(lastCompletedDateKey)) / 86400000));
  const daysSinceLastSecure = effectiveMissedDays;
  const showRecoveryBanner =
    !isGuest &&
    hasActiveChallenge &&
    effectiveMissedDays >= RETENTION_CONFIG.missedOneDayThreshold;
  const showComebackMode =
    !isGuest &&
    effectiveMissedDays >= RETENTION_CONFIG.comebackModeMinDays &&
    effectiveMissedDays <= RETENTION_CONFIG.comebackModeMaxDays;
  const showRestartMode = !isGuest && effectiveMissedDays >= RETENTION_CONFIG.restartThreshold;
  const canUseFreeze = (stats as any)?.canUseFreeze ?? (effectiveMissedDays === RETENTION_CONFIG.streakFreezeEligibleMissedDays && currentStreak > 0);
  const freezesRemaining = (stats as any)?.freezesRemaining ?? 1;
  const lastStandsAvailable = (stats as any)?.lastStandsAvailable ?? 0;
  const bestStreak = stats?.longestStreak || 0;
  const hasActiveChallenge = !!activeChallenge && !!challenge;
  const daySecured = computeProgress.progress === 100 && !canSecureDay;
  const isFirstTimeUser = (stats?.longestStreak ?? 0) === 0 && (stats?.totalDaysSecured ?? 0) === 0 && !hasActiveChallenge;
  
  const tasks: { id: string; title: string; completed: boolean }[] = challenge?.challenge_tasks
    ? challenge.challenge_tasks.map((t: any) => ({
        id: t.id,
        title: t.title || t.type,
        completed: todayCheckins.some((c: any) => c.task_id === t.id && c.status === "completed"),
      }))
    : [];

  const progressColor = daySecured
    ? Colors.streak.shield
    : computeProgress.progress >= 50
    ? Colors.accent
    : Colors.text.muted;

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const handleSecureDay = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (daysSinceLastSecure >= RETENTION_CONFIG.comebackModeMinDays) {
      track({ name: "comeback_day_secured" });
    }
    Animated.sequence([
      Animated.timing(secureBtnScale, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.spring(secureBtnScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    const result = await secureDay();
    setShowCelebration(true);
    if (result?.lastStandEarned) {
      track({ name: "last_stand_earned" });
    }
    if (result?.newStreakCount === 7 || result?.newStreakCount === 30) {
      setShowMilestone(result.newStreakCount);
      track({ name: "milestone_unlocked", streak: result.newStreakCount });
    }
    trpcQuery("leaderboard.getWeekly").then((data: any) => {
      setLeaderboardData({
        currentUserRank: data?.currentUserRank ?? null,
        totalSecuredToday: data?.totalSecuredToday ?? 0,
      });
    }).catch(() => {});
    const currentDay = activeChallenge?.current_day || 1;
    const streak = result?.newStreakCount ?? stats?.activeStreak ?? 0;
    setTimeout(() => {
      router.push({
        pathname: "/secure-confirmation",
        params: {
          day: currentDay.toString(),
          streak: streak.toString(),
          totalDays: (challenge?.duration_days || 0).toString(),
          isHardMode: (challenge?.difficulty === "hard" || challenge?.difficulty === "extreme").toString(),
        },
      } as any);
    }, 1200);
  }, [secureDay, secureBtnScale, activeChallenge, stats, challenge, router, daysSinceLastSecure]);

  if (!isGuest && isLoading && !initialFetchDone) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <HomeScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const glowOpacity = secureBtnGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Celebration visible={showCelebration} onComplete={() => setShowCelebration(false)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {isError && <SyncingBanner />}

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>GRIIT</Text>
            <Text style={styles.logoSubtitle}>Build Discipline Daily</Text>
          </View>
          <View style={styles.headerBadges}>
            <View style={styles.headerBadge}>
              <TrendingUp size={14} color={Colors.text.tertiary} />
              <Text style={styles.headerBadgeText}>{stats?.longestStreak ?? 0}</Text>
            </View>
            <View style={styles.headerBadge}>
              <Flame size={14} color={Colors.accent} />
              <Text style={styles.headerBadgeText}>{currentStreak}</Text>
            </View>
          </View>
        </View>

        {showRecoveryBanner && (
          <View style={styles.recoveryBanner}>
            <AlertTriangle size={18} color={Colors.warning ?? Colors.accent} />
            <View style={styles.recoveryBannerTextWrap}>
              <Text style={styles.recoveryBannerTitle}>
                {showRestartMode
                  ? "Welcome back. Start fresh today."
                  : showComebackMode
                  ? "Secure 3 days in a row to restore momentum."
                  : "You missed yesterday. Secure today to stay in the game."}
              </Text>
              {showRecoveryBanner && lastStandsAvailable >= 0 && (
                <Text style={styles.recoveryBannerSub}>
                  Last Stands remaining: {lastStandsAvailable}
                </Text>
              )}
              {canUseFreeze && (
                <TouchableOpacity
                  style={styles.freezeCta}
                  onPress={() => setShowFreezeModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.freezeCtaText}>Use streak freeze</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {hasActiveChallenge ? (
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
                  <Flame size={18} color={Colors.text.tertiary} />
                  <Text style={styles.metricsText}>{pointsToNextTier} pts to {nextTierName}</Text>
                </View>
              )}
              {leaderboardData && (leaderboardData.totalSecuredToday > 0 || leaderboardData.currentUserRank != null) && (
                <View style={styles.metricsRow}>
                  <Users size={18} color={Colors.text.tertiary} />
                  <Text style={styles.metricsText}>
                    {leaderboardData.totalSecuredToday} {leaderboardData.totalSecuredToday === 1 ? "person" : "people"} secured today
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.todaysResetCard}>
              <View style={styles.todaysResetHeader}>
                <Clock size={18} color={Colors.accent} />
                <Text style={styles.todaysResetTitle}>Today's Reset</Text>
                <Text style={styles.todaysResetTime}>
                  {(() => {
                    const { hours, minutes } = getTimeUntilMidnight();
                    return `${hours}h ${minutes}m left`;
                  })()}
                </Text>
              </View>
              {tasks.length > 0 ? (
                <View style={styles.todaysResetTaskList}>
                  {tasks.map((task, i) => (
                    <View key={task.id} style={styles.todaysResetTaskRow}>
                      <Circle size={18} color={Colors.border} strokeWidth={2} />
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
                <Flame size={20} color={Colors.accent} />
                <Text style={styles.statsSummaryValue}>{currentStreak}</Text>
                <Text style={styles.statsSummaryLabel}>Streak</Text>
                <Text style={styles.statsSummaryLastStand}>Last Stands: {lastStandsAvailable}</Text>
              </View>
              <View style={[styles.statsSummaryCol, styles.statsSummaryColBorder]}>
                <TrendingUp size={20} color={Colors.accent} />
                <Text style={styles.statsSummaryValue}>{stats?.longestStreak ?? 0}</Text>
                <Text style={styles.statsSummaryLabel}>Score</Text>
              </View>
              <View style={styles.statsSummaryCol}>
                <Target size={20} color={Colors.text.tertiary} />
                <Text style={styles.statsSummaryValue}>{tierName}</Text>
                <Text style={styles.statsSummaryLabel}>Rank</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.challengeCard, (challenge.difficulty === "hard" || challenge.difficulty === "extreme") && styles.challengeCardHard]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/challenge/${activeChallenge.challenge_id}` as any);
              }}
              activeOpacity={0.85}
              testID="home-challenge-card"
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
                <ChevronRight size={16} color={Colors.text.tertiary} />
              </View>
            </TouchableOpacity>

            {canSecureDay && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => requireAuth("secure", handleSecureDay)}
                testID="secure-day-button"
              >
                <Animated.View style={[styles.secureDayButton, { transform: [{ scale: secureBtnScale }] }]}>
                  <Animated.View style={[styles.secureDayGlow, { opacity: glowOpacity }]} />
                  <Text style={styles.secureDayText}>Secure Day</Text>
                </Animated.View>
              </TouchableOpacity>
            )}

            {daySecured && (
              <View style={styles.securedBanner}>
                <CheckCircle2 size={16} color={Colors.streak.shield} fill={Colors.streak.shield} strokeWidth={0} />
                <Text style={styles.securedText}>Day {activeChallenge.current_day} Secured</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.welcomeBackCard}>
            <RefreshCw size={28} color={Colors.accent} />
            <Text style={styles.welcomeBackTitle}>
              {isFirstTimeUser ? "Start your first challenge." : "Welcome back."}
            </Text>
            <Text style={styles.welcomeBackSub}>
              {isFirstTimeUser
                ? "Pick a challenge, commit, and secure your first day."
                : "Secure 1 day today to restart momentum."}
            </Text>
            <TouchableOpacity
              style={styles.pickChallengeButton}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                requireAuth("join", () => router.push("/(tabs)/discover" as any));
              }}
              activeOpacity={0.85}
              testID="discover-cta"
            >
              <Text style={styles.pickChallengeButtonText}>
                {isFirstTimeUser ? "Find a challenge" : "Pick a Challenge"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.liveSection}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>LIVE</Text>
          <Text style={styles.liveSub}>People are moving</Text>
        </View>

        {leaderboardData?.currentUserRank != null ? (
          <View style={styles.yourPositionCard}>
            <Target size={28} color={Colors.accent} />
            <Text style={styles.yourPositionLabel}>YOUR POSITION</Text>
            <Text style={styles.yourPositionText}>You are ranked <Text style={styles.feedBold}>#{leaderboardData.currentUserRank}</Text> this week.</Text>
            <TouchableOpacity
              style={styles.secureNowButton}
              onPress={() => requireAuth("secure", () => router.push("/(tabs)/discover" as any))}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={18} color="#fff" />
              <Text style={styles.secureNowButtonText}>Secure Now</Text>
            </TouchableOpacity>
          </View>
        ) : !isGuest && (
          <TouchableOpacity
            style={styles.yourPositionCard}
            onPress={() => router.push("/(tabs)/activity" as any)}
            activeOpacity={0.85}
          >
            <Target size={28} color={Colors.accent} />
            <Text style={styles.yourPositionLabel}>LEADERBOARD</Text>
            <Text style={styles.yourPositionText}>Be the first this week.</Text>
            <Text style={styles.secureNowButtonText}>View Activity</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerTagline}>Only discipline shows here.</Text>
      </ScrollView>

      {showMilestone != null && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={styles.freezeModalBackdrop} activeOpacity={1} onPress={() => setShowMilestone(null)} />
          <View style={styles.freezeModalCenter}>
            <View style={styles.freezeModalCard}>
              <Text style={styles.freezeModalTitle}>{showMilestone}-Day Streak</Text>
              <Text style={styles.freezeModalSub}>You are building discipline.</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, { marginBottom: 8 }]}
                onPress={() => {
                  track({ name: "invite_shared", source: "milestone_modal" });
                  const joinUrl = Linking.createURL("/(tabs)/discover");
                  const message = `I just hit a ${showMilestone}-day streak on GRIIT. Join me: ${joinUrl}`;
                  if (Platform.OS === "web") {
                    try { navigator.clipboard.writeText(message); } catch { /* ignore */ }
                    Alert.alert("Copied", "Invite message copied.");
                  } else {
                    Share.share({ title: "My streak on GRIIT", message }).catch(() => {});
                  }
                  setShowMilestone(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>Invite a friend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.freezeModalCancel]}
                onPress={() => setShowMilestone(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalCancelText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showFreezeModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={styles.freezeModalBackdrop} activeOpacity={1} onPress={() => !freezeSubmitting && setShowFreezeModal(false)} />
          <View style={styles.freezeModalCenter}>
            <View style={styles.freezeModalCard}>
              <Text style={styles.freezeModalTitle}>Use your streak freeze?</Text>
              <Text style={styles.freezeModalSub}>
                This will save your streak. You get 1 free freeze per month.{freezesRemaining !== undefined && freezesRemaining >= 0 ? ` (${freezesRemaining} left this month)` : ""}
              </Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm, freezeSubmitting && styles.freezeModalConfirmDisabled]}
                disabled={freezeSubmitting}
                onPress={async () => {
                  track({ name: "streak_freeze_used" });
                  setFreezeSubmitting(true);
                  try {
                    await trpcMutate("streaks.useFreeze", { dateKeyToFreeze: yesterdayKey });
                    await refetchAll();
                    setShowFreezeModal(false);
                  } catch (e: any) {
                    Alert.alert("Error", e?.message ?? "Could not use freeze.");
                  } finally {
                    setFreezeSubmitting(false);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>{freezeSubmitting ? "..." : "Use freeze"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.freezeModalCancel} onPress={() => setShowFreezeModal(false)} disabled={freezeSubmitting} activeOpacity={0.8}>
                <Text style={styles.freezeModalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showLastStandUsedModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity style={styles.freezeModalBackdrop} activeOpacity={1} onPress={() => setShowLastStandUsedModal(false)} />
          <View style={styles.freezeModalCenter}>
            <View style={styles.freezeModalCard}>
              <Text style={styles.freezeModalTitle}>Last Stand used.</Text>
              <Text style={styles.freezeModalSub}>Streak preserved.</Text>
              <TouchableOpacity
                style={[styles.freezeModalConfirm]}
                onPress={() => setShowLastStandUsedModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.freezeModalConfirmText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 6,
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.muted,
  },
});

const syncingBannerStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  text: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    flex: 1,
  },
});

const progressStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Colors.pill,
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
    color: Colors.text.primary,
    flex: 1,
  },
  titleCompleted: {
    color: Colors.text.tertiary,
    textDecorationLine: "line-through",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  logo: {
    fontSize: 26,
    fontWeight: "900" as const,
    color: Colors.text.primary,
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  secureTodayTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  secureTodaySub: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 16,
  },
  metricsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricsText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.primary,
  },
  todaysResetCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todaysResetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  todaysResetTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  todaysResetTime: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  todaysResetTaskList: {
    gap: 8,
  },
  todaysResetTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todaysResetTaskText: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  todaysResetTaskDone: {
    color: Colors.text.tertiary,
    textDecorationLine: "line-through",
  },
  statsSummaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsSummaryCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statsSummaryColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statsSummaryValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  statsSummaryLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
  },
  statsSummaryLastStand: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  welcomeBackCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  welcomeBackTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  welcomeBackSub: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  pickChallengeButton: {
    backgroundColor: Colors.pill,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  pickChallengeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  liveSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C62828",
  },
  liveTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  liveSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    flex: 1,
  },
  feedCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedCardChallenge: {
    borderColor: Colors.accent + "40",
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
    backgroundColor: Colors.pill,
  },
  feedAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.pill,
  },
  feedBody: {
    flex: 1,
    gap: 4,
  },
  feedMain: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.primary,
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
    color: Colors.accent,
  },
  feedTime: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  feedDiscipline: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  feedRank: {
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  feedSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  feedHighlight: {
    fontWeight: "700" as const,
    color: "#D4A017",
  },
  feedCta: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.accent,
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
    backgroundColor: Colors.pill,
    alignSelf: "flex-start",
  },
  feedPillText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  feedOpenChallengeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  yourPositionLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  yourPositionText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  secureNowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secureNowButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  footerTagline: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginBottom: 24,
  },
  activeSection: {
    gap: 4,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  missionControlCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text.primary,
    letterSpacing: -2,
    lineHeight: 56,
  },
  dayNumberTotal: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
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
    color: Colors.text.secondary,
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
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  challengeTitleMission: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.primary,
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
    borderColor: Colors.border,
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
    borderTopColor: Colors.border,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
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
    color: Colors.text.secondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  taskList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 2,
  },
  secureDayButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  secureDayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.streak.shield,
  },
  secureDayText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#fff",
    letterSpacing: 0.3,
  },
  securedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.streak.shield + "0F",
    borderRadius: 14,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: Colors.streak.shield + "25",
  },
  securedText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.streak.shield,
    letterSpacing: 0.2,
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
    color: Colors.text.tertiary,
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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guestBarText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  guestBarCta: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  guestBarCtaText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
  },
  recoveryBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: (Colors.warningLight ?? Colors.accentLight) || "#FFF5F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: (Colors.warning ?? Colors.accent) + "30",
  },
  recoveryBannerTextWrap: { flex: 1 },
  recoveryBannerTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recoveryBannerSub: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  freezeCta: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.accent,
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
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freezeModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  freezeModalSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  freezeModalConfirm: {
    backgroundColor: Colors.accent,
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
    color: Colors.text.secondary,
  },
  emptyTitleNew: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
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
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
