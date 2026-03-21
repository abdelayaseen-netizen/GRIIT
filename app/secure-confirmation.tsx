import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Check, Share2, ChevronRight } from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DS_COLORS } from "@/lib/design-system";
import { shareDaySecured, shareChallengeComplete } from "@/lib/share";
import { requestReviewIfAppropriate } from "@/lib/request-review";
import { ROUTES } from "@/lib/routes";
import { track, trackEvent } from "@/lib/analytics";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

const SECURE_DAY_MESSAGES = [
  "Day {day} Secured.",
  "You showed up. Day {day} locked in.",
  "Another one. Day {day} secured.",
  "Discipline wins. Day {day} done.",
  "Day {day} in the books. Keep going.",
];

export default function SecureConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [shareError, setShareError] = React.useState(false);

  const day = params.day as string | undefined;
  const streak = params.streak as string | undefined;
  const totalDays = params.totalDays as string | undefined;
  const challengeId = params.challengeId as string | undefined;
  const activeChallengeId = params.activeChallengeId as string | undefined;
  const isHardMode = params.isHardMode === "true";
  const challengeName = (params.challengeName as string) ?? "";

  const dayNum = parseInt(day ?? "0", 10);
  const totalNum = parseInt(totalDays ?? "0", 10);
  const streakNum = parseInt(streak ?? "0", 10);
  const isCompletion = totalNum > 1 && dayNum === totalNum;
  const isMilestoneDay = dayNum === 30 || dayNum === 75;

  const milestoneQuery = useQuery({
    queryKey: ["milestoneShared", activeChallengeId],
    queryFn: () => trpcQuery(TRPC.checkins.getMilestoneShared, { activeChallengeId: activeChallengeId! }) as Promise<{ milestone_30_shared: boolean; milestone_75_shared: boolean }>,
    enabled: !!activeChallengeId && isMilestoneDay,
  });
  const setMilestoneShared = useMutation({
    mutationFn: (milestoneDay: 30 | 75) =>
      trpcMutate(TRPC.checkins.setMilestoneShared, { activeChallengeId: activeChallengeId!, milestoneDay }),
  });
  const alreadyShared = dayNum === 30
    ? milestoneQuery.data?.milestone_30_shared
    : dayNum === 75
    ? milestoneQuery.data?.milestone_75_shared
    : true;
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneShareLoading, setMilestoneShareLoading] = useState(false);
  useEffect(() => {
    if (isMilestoneDay && !!activeChallengeId && milestoneQuery.data !== undefined && !alreadyShared) {
      setShowMilestoneModal(true);
    }
  }, [isMilestoneDay, activeChallengeId, milestoneQuery.data, alreadyShared]);

  const headerMessage = React.useMemo(() => {
    if (isCompletion && challengeName) {
      return `You completed ${challengeName}!`;
    }
    if (isCompletion) {
      return "Challenge complete!";
    }
    const d = day ?? "0";
    const i = Math.floor(Math.random() * SECURE_DAY_MESSAGES.length);
    const msg = SECURE_DAY_MESSAGES[i] ?? SECURE_DAY_MESSAGES[0] ?? "";
    return msg.replace(/\{day\}/g, d);
  }, [day, isCompletion, challengeName]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    if (isCompletion) {
      track({ name: "challenge_completed", challenge_name: challengeName, duration: totalNum });
      trackEvent("challenge_completed", {
        challenge_id: challengeId ?? "",
        days: totalNum,
      });
    }

    // In-app review: after 7th day secured or challenge completion (throttled to once per 30 days)
    const reviewDelay = setTimeout(() => {
      requestReviewIfAppropriate({
        streak: streakNum,
        challengeJustCompleted: isCompletion,
      }).catch(() => {});
    }, 1500);

    // Auto-back only for regular day secured; completion screen stays until user taps Share or What's next
    if (!isCompletion) {
      const timer = setTimeout(() => {
        if (challengeId) {
          router.replace(ROUTES.CHALLENGE_ID(challengeId) as never);
        } else {
          router.replace(ROUTES.TABS as never);
        }
      }, 2500);
      return () => {
        clearTimeout(timer);
        clearTimeout(reviewDelay);
      };
    }
    return () => clearTimeout(reviewDelay);
  }, [scaleAnim, fadeAnim, progressAnim, router, isCompletion, streakNum, challengeId]);

  if (!day || !streak || !totalDays) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.content}>
          <Text style={styles.header}>Not found</Text>
          <TouchableOpacity style={styles.shareButton} onPress={() => router.back()} activeOpacity={0.85} accessibilityLabel="Return to home" accessibilityRole="button">
            <Text style={styles.shareButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${totalNum > 0 ? (dayNum / totalNum) * 100 : 0}%`],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconOuter}>
            <View style={[styles.iconInner, isHardMode && styles.iconInnerHard]}>
              <Shield size={40} color={DS_COLORS.white} fill={DS_COLORS.white} />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.header}>{headerMessage}</Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Check size={16} color={DS_COLORS.success} />
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <Text style={styles.statValue}>{streak} days</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Shield size={16} color={DS_COLORS.textMuted} />
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <Text style={styles.statValue}>
                {day}/{totalDays}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth, backgroundColor: isHardMode ? DS_COLORS.accent : DS_COLORS.success },
                ]}
              />
            </View>
          </View>

          {isHardMode && (
            <View style={styles.hardModeTag}>
              <Text style={styles.hardModeText}>Hard Mode</Text>
            </View>
          )}

          {shareError && (
            <Text style={[styles.statLabel, { color: DS_COLORS.dangerDark, marginBottom: 8 }]}>Share failed. Tap to retry.</Text>
          )}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              setShareError(false);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (isCompletion) {
                shareChallengeComplete({
                  name: challengeName || "this challenge",
                  duration: totalNum,
                  daysCompleted: dayNum,
                  isHardMode,
                }).catch(() => setShareError(true));
              } else {
                shareDaySecured({
                  streak: streakNum,
                  dayNumber: dayNum,
                }).catch(() => setShareError(true));
              }
            }}
            activeOpacity={0.85}
            accessibilityLabel="Share your achievement"
            accessibilityRole="button"
          >
            <Share2 size={18} color={DS_COLORS.accent} />
            <Text style={styles.shareButtonText}>{isCompletion ? "Share your achievement" : "Share Your Win"}</Text>
          </TouchableOpacity>

          {isCompletion && (
            <TouchableOpacity
              style={[styles.shareButton, styles.whatsNextButton]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace(ROUTES.TABS_DISCOVER as never);
              }}
              activeOpacity={0.85}
              accessibilityLabel="Find your next challenge"
              accessibilityRole="button"
            >
              <Text style={styles.whatsNextText}>What&apos;s next?</Text>
              <ChevronRight size={20} color={DS_COLORS.white} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {showMilestoneModal && isMilestoneDay && (
        <Modal visible transparent animationType="fade">
          <View style={milestoneStyles.backdrop}>
            <View style={milestoneStyles.card}>
              <Text style={milestoneStyles.dayText}>Day {dayNum}</Text>
              <Text style={milestoneStyles.title}>You actually did it.</Text>
              <TouchableOpacity
                style={milestoneStyles.shareCta}
                onPress={async () => {
                  setMilestoneShareLoading(true);
                  try {
                    await shareDaySecured({
                      streak: streakNum,
                      challengeName,
                      dayNumber: dayNum,
                    });
                    await setMilestoneShared.mutateAsync(dayNum as 30 | 75);
                    setShowMilestoneModal(false);
                  } catch {
                    // user cancelled or error
                  } finally {
                    setMilestoneShareLoading(false);
                  }
                }}
                disabled={milestoneShareLoading}
              >
                {milestoneShareLoading ? (
                  <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
                ) : (
                  <Text style={milestoneStyles.shareCtaText}>Share this moment</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={milestoneStyles.continueBtn}
                onPress={async () => {
                  if (activeChallengeId) await setMilestoneShared.mutateAsync(dayNum as 30 | 75);
                  setShowMilestoneModal(false);
                }}
              >
                <Text style={milestoneStyles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const milestoneStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  dayText: {
    fontSize: 48,
    fontWeight: "800",
    color: DS_COLORS.ACCENT_PRIMARY,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: 28,
  },
  shareCta: {
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  shareCtaText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.WHITE },
  continueBtn: { paddingVertical: 12 },
  continueBtnText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textSecondary },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DS_COLORS.success + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DS_COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInnerHard: {
    backgroundColor: DS_COLORS.accent,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    fontSize: 36,
    fontWeight: "900" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: -1,
  },
  statsCard: {
    width: "100%",
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: 20,
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
    gap: 8,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginVertical: 16,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  hardModeTag: {
    backgroundColor: "rgba(232,125,79,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.25)",
  },
  hardModeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: DS_COLORS.accent,
    letterSpacing: 0.5,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.accent + "12",
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.accent,
  },
  whatsNextButton: {
    marginTop: 12,
    backgroundColor: DS_COLORS.accent,
    borderColor: DS_COLORS.accent,
  },
  whatsNextText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
  },
});
