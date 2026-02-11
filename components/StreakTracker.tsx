import React, { useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Flame, Shield, Trophy, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface StreakTrackerProps {
  currentStreak: number;
  bestStreak: number;
  daySecured: boolean;
  streakProtectionsLeft?: number;
  onStreakPress?: () => void;
}

const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

function getNextMilestone(streak: number): number {
  for (const m of MILESTONES) {
    if (streak < m) return m;
  }
  return streak + 30;
}

function getStreakMessage(streak: number, secured: boolean): string {
  if (streak === 0) return secured ? "Day 1 begins" : "Start your streak";
  if (secured) {
    if (streak >= 90) return `Day ${streak} secured. Legend.`;
    if (streak >= 30) return `Day ${streak} secured. Unstoppable.`;
    if (streak >= 14) return `Day ${streak} secured. Building momentum.`;
    if (streak >= 7) return `Day ${streak} secured. One week strong.`;
    return `Day ${streak} secured`;
  }
  if (streak >= 30) return `${streak} day streak. Don't break it.`;
  if (streak >= 7) return `${streak} day streak. Keep going.`;
  return `${streak} day streak`;
}

function getStreakTier(streak: number): { color: string; label: string } {
  if (streak >= 90) return { color: Colors.milestone.gold, label: "LEGENDARY" };
  if (streak >= 30) return { color: Colors.streak.fire, label: "ON FIRE" };
  if (streak >= 14) return { color: Colors.streak.shield, label: "BUILDING" };
  if (streak >= 7) return { color: "#0EA5E9", label: "ROLLING" };
  return { color: Colors.text.tertiary, label: "" };
}

export default function StreakTracker({
  currentStreak,
  bestStreak,
  daySecured,
  streakProtectionsLeft = 1,
  onStreakPress,
}: StreakTrackerProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const nextMilestone = useMemo(() => getNextMilestone(currentStreak), [currentStreak]);
  const progress = useMemo(() => {
    const prevMilestone = MILESTONES.filter(m => m <= currentStreak).pop() || 0;
    return ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  }, [currentStreak, nextMilestone]);

  const tier = useMemo(() => getStreakTier(currentStreak), [currentStreak]);
  const message = useMemo(() => getStreakMessage(currentStreak, daySecured), [currentStreak, daySecured]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (currentStreak >= 7) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(fireAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(fireAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [currentStreak, fireAnim]);

  useEffect(() => {
    if (daySecured) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }
  }, [daySecured, glowAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onStreakPress?.();
  }, [onStreakPress, scaleAnim]);

  const fireScale = fireAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const streakColor = currentStreak >= 7 ? Colors.streak.fire : Colors.text.secondary;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {daySecured && (
          <Animated.View style={[styles.securedGlow, { opacity: glowOpacity }]} />
        )}

        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            {daySecured ? (
              <Animated.View style={{ transform: [{ scale: fireScale }] }}>
                <Shield size={28} color={Colors.streak.shield} fill={Colors.streak.shield} />
              </Animated.View>
            ) : currentStreak >= 7 ? (
              <Animated.View style={{ transform: [{ scale: fireScale }] }}>
                <Flame size={28} color={Colors.streak.fire} fill={Colors.streak.fire} />
              </Animated.View>
            ) : (
              <Flame size={28} color={Colors.text.tertiary} />
            )}
          </View>

          <View style={styles.streakInfo}>
            <View style={styles.numberRow}>
              <Text style={[styles.streakNumber, { color: streakColor }]}>
                {currentStreak}
              </Text>
              {tier.label ? (
                <View style={[styles.tierBadge, { backgroundColor: tier.color + "18" }]}>
                  <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.message}>{message}</Text>
          </View>

          {streakProtectionsLeft > 0 && currentStreak >= 3 && (
            <View style={styles.protectionBadge}>
              <Shield size={12} color={Colors.streak.shield} />
              <Text style={styles.protectionText}>{streakProtectionsLeft}</Text>
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: barWidth,
                  backgroundColor: daySecured ? Colors.streak.shield : streakColor,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressCurrent}>Day {currentStreak}</Text>
            <View style={styles.milestoneTarget}>
              <Trophy size={10} color={Colors.milestone.gold} />
              <Text style={styles.progressTarget}>Day {nextMilestone}</Text>
            </View>
          </View>
        </View>

        {currentStreak > 0 && bestStreak > currentStreak && (
          <View style={styles.bestRow}>
            <Zap size={11} color={Colors.text.tertiary} />
            <Text style={styles.bestText}>Best: {bestStreak} days</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  securedGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.streak.shield,
    borderRadius: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  streakInfo: {
    flex: 1,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 1,
  },
  message: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  protectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.streak.shield + "10",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  protectionText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.streak.shield,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.pill,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressCurrent: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
  },
  milestoneTarget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  progressTarget: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.milestone.gold,
  },
  bestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    justifyContent: "center",
  },
  bestText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
  },
});
