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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Plus,
  Shield,
  CheckCircle2,
  Clock,
  Wifi,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import StreakTracker from "@/components/StreakTracker";
import StreakCalendar from "@/components/StreakCalendar";
import { HomeScreenSkeleton } from "@/components/SkeletonLoader";
import Celebration from "@/components/Celebration";

function OfflineBadge() {
  return (
    <View style={badgeStyles.container}>
      <Wifi size={11} color={Colors.text.muted} />
      <Text style={badgeStyles.text}>Offline mode</Text>
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
  const secureBtnScale = useRef(new Animated.Value(1)).current;
  const secureBtnGlow = useRef(new Animated.Value(0)).current;

  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
  const hasActiveChallenge = !!activeChallenge && !!challenge;
  const daySecured = computeProgress.progress === 100 && !canSecureDay;
  
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

  const handleSecureDay = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.sequence([
      Animated.timing(secureBtnScale, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.spring(secureBtnScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    secureDay();
    setShowCelebration(true);
    
    const currentDay = activeChallenge?.current_day || 1;
    const streak = stats?.activeStreak || 0;
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
  }, [secureDay, secureBtnScale, activeChallenge, stats, challenge, router]);

  if (isLoading && !initialFetchDone) {
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
        {isError && <OfflineBadge />}

        <View style={styles.header}>
          <Text style={styles.logo}>GRIT</Text>
        </View>

        {hasActiveChallenge ? (
          <View style={styles.activeSection}>
            <View style={styles.missionControlCard}>
              <View style={styles.dayNumberSection}>
                <Text style={styles.dayNumberLarge}>
                  Day {activeChallenge.current_day}
                </Text>
                <Text style={styles.dayNumberTotal}>/ {challenge.duration_days || "∞"}</Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {daySecured ? "Secured" : "Pending"}
                </Text>
                {(challenge.difficulty === "hard" || challenge.difficulty === "extreme") && (
                  <View style={styles.modeTagHard}>
                    <Text style={styles.modeTagText}>Hard Mode</Text>
                  </View>
                )}
              </View>

              <View style={styles.challengeTitleRow}>
                <Text style={styles.challengeTitleMission} numberOfLines={2}>{challenge.title}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.challengeCard,
                (challenge.difficulty === "hard" || challenge.difficulty === "extreme") && styles.challengeCardHard,
              ]}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
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
                onPress={handleSecureDay}
                testID="secure-day-button"
              >
                <Animated.View style={[styles.secureDayButton, { transform: [{ scale: secureBtnScale }] }]}>
                  <Animated.View
                    style={[
                      styles.secureDayGlow,
                      { opacity: glowOpacity },
                    ]}
                  />
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

            <View style={styles.streakSectionSpaced}>
              <StreakTracker
                currentStreak={currentStreak}
                bestStreak={bestStreak}
                daySecured={daySecured}
                streakProtectionsLeft={1}
              />

              <StreakCalendar
                currentStreak={currentStreak}
                daySecuredToday={daySecured}
              />
            </View>
          </View>
        ) : (
          <View style={styles.emptySection}>
            <View style={styles.emptyProgressSection}>
              <CircularProgress size={140} strokeWidth={2} progress={0} />
            </View>

            <Text style={styles.emptyTitleNew}>No active commitment.</Text>
            <Text style={styles.emptySubtitle}>
              Discipline starts with one decision.
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push("/(tabs)/discover" as any);
              }}
              activeOpacity={0.85}
              testID="discover-cta"
            >
              <Text style={styles.ctaButtonText}>Discover Challenges</Text>
            </TouchableOpacity>

            <Text style={styles.supportingText}>Join others building consistency.</Text>
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900" as const,
    color: Colors.text.primary,
    letterSpacing: 2,
  },
  activeSection: {
    gap: 20,
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
