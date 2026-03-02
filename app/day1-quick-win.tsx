import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { CheckCircle2, Shield } from "lucide-react-native";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { track } from "@/lib/analytics";
import { trpcMutate } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { getDay1TtfvSeconds } from "@/lib/starter-join";

export default function Day1QuickWinScreen() {
  const router = useRouter();
  const { refetchAll } = useApp();
  const params = useLocalSearchParams<{
    activeChallengeId?: string;
    taskId?: string;
    challengeId?: string;
    title?: string;
    taskTitle?: string;
    taskType?: string;
    starterId?: string;
    primaryGoal?: string;
    dailyTimeBudget?: string;
  }>();
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [securing, setSecuring] = useState(false);

  const activeChallengeId = params.activeChallengeId ?? "";
  const taskId = params.taskId ?? "";
  const challengeId = params.challengeId ?? "";
  const title = params.title ?? "Starter";
  const taskTitle = params.taskTitle ?? "Complete your first task";
  const taskType = (params.taskType as string) ?? "checkin";

  const handleMarkComplete = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeChallengeId && taskId) {
      try {
        await trpcMutate("checkins.complete", { activeChallengeId, taskId });
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Could not save completion.");
        return;
      }
    }
    setTaskCompleted(true);
    const ttfv = await getDay1TtfvSeconds();
    track({
      name: "day1_task_completed",
      challengeId,
      ...(ttfv != null && { ttfv_seconds: ttfv }),
      ...(params.starterId && { starter_id: params.starterId }),
      ...(params.primaryGoal && { primary_goal: params.primaryGoal }),
      ...(params.dailyTimeBudget && { daily_time_budget: params.dailyTimeBudget }),
    });
  }, [activeChallengeId, taskId, challengeId, params.starterId, params.primaryGoal, params.dailyTimeBudget]);

  const handleSecureDay = useCallback(async () => {
    if (!taskCompleted || securing) return;
    setSecuring(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      if (activeChallengeId) {
        await trpcMutate("checkins.secureDay", { activeChallengeId });
        await refetchAll();
      }
      track({ name: "day1_secured", challengeId });
      setShowCelebration(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not secure day.");
    } finally {
      setSecuring(false);
    }
  }, [taskCompleted, securing, challengeId, activeChallengeId, refetchAll, params.starterId, params.primaryGoal, params.dailyTimeBudget]);

  const handleGoToHome = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCelebration(false);
    router.replace("/(tabs)" as any);
  }, [router]);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.content}>
        <Text style={s.dayLabel}>Day 1</Text>
        <Text style={s.title}>{title}</Text>

        <View style={s.taskCard}>
          <Text style={s.taskTitle}>{taskTitle}</Text>
          {taskCompleted ? (
            <View style={s.completedRow}>
              <CheckCircle2 size={22} color={colors.successGreenText} fill={colors.successGreenText} strokeWidth={0} />
              <Text style={s.completedText}>Done</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={s.markCompleteBtn}
              onPress={handleMarkComplete}
              activeOpacity={0.85}
            >
              <Text style={s.markCompleteBtnText}>Mark complete</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[s.secureBtn, (!taskCompleted || securing) && s.secureBtnDisabled]}
          onPress={handleSecureDay}
          disabled={!taskCompleted || securing}
          activeOpacity={0.85}
        >
          <Text style={s.secureBtnText}>Secure Day</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={s.celebrationBackdrop}>
          <View style={s.celebrationCard}>
            <View style={s.celebrationIconWrap}>
              <Shield size={48} color="#fff" fill="#fff" />
            </View>
            <Text style={s.celebrationTitle}>Day 1 secured.</Text>
            <Text style={s.celebrationSub}>
              You're officially in motion. Come back tomorrow to protect your streak.
            </Text>
            <View style={s.celebrationStats}>
              <Text style={s.celebrationStatLabel}>Streak</Text>
              <Text style={s.celebrationStatValue}>1</Text>
            </View>
            <View style={s.celebrationStats}>
              <Text style={s.celebrationStatLabel}>Points</Text>
              <Text style={s.celebrationStatValue}>+12</Text>
            </View>
            <TouchableOpacity style={s.goHomeBtn} onPress={handleGoToHome} activeOpacity={0.85}>
              <Text style={s.goHomeBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 40,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.successGreenText,
  },
  markCompleteBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.tag,
    backgroundColor: colors.accentOrange,
  },
  markCompleteBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  secureBtn: {
    backgroundColor: colors.black,
    paddingVertical: 20,
    borderRadius: radius.primaryButton,
    alignItems: "center",
    justifyContent: "center",
  },
  secureBtnDisabled: {
    opacity: 0.45,
  },
  secureBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  celebrationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.cardLarge,
    padding: 32,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  celebrationIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.successGreenText,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  celebrationSub: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  celebrationStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  celebrationStatLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  celebrationStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  goHomeBtn: {
    marginTop: 28,
    backgroundColor: colors.accentOrange,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.primaryButton,
    width: "100%",
    alignItems: "center",
  },
  goHomeBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});
