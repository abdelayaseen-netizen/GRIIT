import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Share2, Award, TrendingUp } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { shareChallenge, shareChallengeComplete } from "@/lib/share";
import { useAuth } from "@/contexts/AuthContext";

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const refUserId = user?.id ?? null;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;

  const title = params.title as string;
  const duration = params.duration as string;
  const tasksCount = params.tasksCount as string;
  const difficulty = params.difficulty as string;
  const daysCompleted = params.daysCompleted as string;
  const finalStreak = params.finalStreak as string;
  const isCreateSuccess = params.isCreateSuccess === "true";
  const waitingForTeam = params.waitingForTeam === "true";

  const isHardMode = difficulty === "hard" || difficulty === "extreme";

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 7,
        delay: 150,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(statsSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [badgeScale, fadeAnim, statsSlide]);

  const handleContinue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace(ROUTES.TABS as never);
  };

  const handleShare = async () => {
    try {
      if (isCreateSuccess) {
        await shareChallenge(
          {
            name: title,
            duration: Number(duration) || 0,
            id: (params.challengeId as string) || "",
            tasksPerDay: Number(tasksCount) || 0,
          },
          refUserId
        );
      } else {
        await shareChallengeComplete({
          name: title,
          duration: Number(duration) || 0,
          daysCompleted: Number(daysCompleted) || 0,
          isHardMode,
        });
      }
    } catch {
      // Share failed — optional action, no alert
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.badgeContainer,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <View style={[styles.badgeOuter, isHardMode && styles.badgeOuterHard]}>
            <View style={[styles.badgeInner, isHardMode && styles.badgeInnerHard]}>
              <Award size={48} color={DS_COLORS.white} />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.header}>{isCreateSuccess ? "Challenge created." : "Challenge Complete."}</Text>

          {!isCreateSuccess && isHardMode && (
            <View style={styles.hardModeTag}>
              <Shield size={14} color={DS_COLORS.accent} />
              <Text style={styles.hardModeTagText}>Hard Mode</Text>
            </View>
          )}

          <Text style={styles.challengeTitle}>{title}</Text>
        </Animated.View>

        {!isCreateSuccess && (
          <Animated.View
            style={[
              styles.statsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: statsSlide }],
              },
            ]}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <TrendingUp size={18} color={DS_COLORS.success} />
                <Text style={styles.statLabel}>Final Streak</Text>
              </View>
              <Text style={styles.statValue}>{finalStreak ?? "0"} days</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Shield size={18} color={DS_COLORS.success} />
                <Text style={styles.statLabel}>Days Secured</Text>
              </View>
              <Text style={styles.statValue}>{daysCompleted ?? "0"}/{duration}</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View style={[styles.recognitionCard, { opacity: fadeAnim }]}>
          <Text style={styles.recognitionText}>
            {isCreateSuccess
              ? waitingForTeam
                ? "Waiting for team members to join. Share the challenge so they can sign up."
                : `${duration} days · ${tasksCount} task${tasksCount === "1" ? "" : "s"}. Share it and get others to join.`
              : "You showed up consistently."}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.primaryButton, isHardMode && styles.primaryButtonHard]}
            onPress={handleContinue}
            activeOpacity={0.85}
            accessibilityLabel="Continue"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel={isCreateSuccess ? "Share challenge" : "Share completion"}
            accessibilityRole="button"
          >
            <Share2 size={18} color={DS_COLORS.textSecondary} />
            <Text style={styles.secondaryButtonText}>{isCreateSuccess ? "Share challenge" : "Share Completion"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    marginBottom: 32,
  },
  badgeOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: DS_COLORS.success + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOuterHard: {
    backgroundColor: "rgba(232,125,79,0.15)",
  },
  badgeInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DS_COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInnerHard: {
    backgroundColor: DS_COLORS.accent,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  header: {
    fontSize: 38,
    fontWeight: "900" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -1,
  },
  hardModeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(232,125,79,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.25)",
    marginBottom: 12,
  },
  hardModeTagText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: DS_COLORS.accent,
    letterSpacing: 0.3,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  statsCard: {
    width: "100%",
    backgroundColor: DS_COLORS.white,
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  statValue: {
    fontSize: 19,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginVertical: 18,
  },
  recognitionCard: {
    width: "100%",
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 14,
    padding: 18,
    marginBottom: 32,
  },
  recognitionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: DS_COLORS.overlayDark,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonHard: {
    backgroundColor: DS_COLORS.accent,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: DS_COLORS.white,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.white,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
});
