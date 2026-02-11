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
  Compass,
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
  }, [secureDay, secureBtnScale]);

  if (isLoading && !initialFetchDone) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <HomeScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const hasActiveChallenge = !!activeChallenge && !!challenge;
  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
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

            <TouchableOpacity
              style={styles.challengeCard}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push(`/challenge/${activeChallenge.challenge_id}`);
              }}
              activeOpacity={0.85}
              testID="home-challenge-card"
            >
              <View style={styles.challengeHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.challengeTitle} numberOfLines={1}>{challenge.title}</Text>
                  <Text style={styles.challengeDay}>
                    Day {activeChallenge.current_day}{challenge.duration_days ? ` of ${challenge.duration_days}` : ""}
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.text.muted} />
              </View>

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
                  <Shield size={20} color="#fff" fill="#fff" />
                  <Text style={styles.secureDayText}>Secure Today</Text>
                </Animated.View>
              </TouchableOpacity>
            )}

            {daySecured && (
              <View style={styles.securedBanner}>
                <Shield size={18} color={Colors.streak.shield} fill={Colors.streak.shield} />
                <Text style={styles.securedText}>Day Secured</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <View style={styles.emptyIconWrap}>
              <Compass size={40} color={Colors.text.muted} strokeWidth={1.2} />
            </View>
            <Text style={styles.emptyTitle}>No Active Challenge</Text>
            <Text style={styles.emptyText}>
              Your journey starts with one challenge.{"\n"}Pick one that matches your energy.
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                router.push("/(tabs)/discover");
              }}
              activeOpacity={0.85}
              testID="discover-cta"
            >
              <Compass size={18} color="#fff" />
              <Text style={styles.ctaButtonText}>Discover Challenges</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/(tabs)/create");
              }}
              activeOpacity={0.7}
              testID="create-cta"
            >
              <Plus size={16} color={Colors.accent} />
              <Text style={styles.ctaSecondaryText}>Create Your Own</Text>
            </TouchableOpacity>
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
    gap: 14,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  challengeDay: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  progressSection: {
    gap: 8,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secureDayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 18,
    overflow: "hidden",
  },
  secureDayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.streak.shield,
  },
  secureDayText: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#fff",
    letterSpacing: 0.3,
  },
  securedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.streak.shield + "12",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.streak.shield + "30",
  },
  securedText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.streak.shield,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  ctaSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaSecondaryText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
});
