import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle2 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { DS_COLORS } from "@/lib/design-system";
import { track } from "@/lib/analytics";
import { useApp } from "@/contexts/AppContext";
import { getDay1TtfvSeconds, setFirstSessionJustFinished } from "@/lib/starter-join";
import { ROUTES } from "@/lib/routes";
import Celebration from "@/components/Celebration";

const ACCOUNTABILITY_PROMPT_DISMISSED_KEY = "grit_accountability_prompt_dismissed";

type WinStep = 1 | 2 | 3;

export default function Day1QuickWinScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const { completeTask, refetchAll } = useApp();
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

  const [winStep, setWinStep] = useState<WinStep>(1);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAccountabilityPrompt, setShowAccountabilityPrompt] = useState(false);
  const [intentionText, setIntentionText] = useState("");
  const [completing, setCompleting] = useState(false);

  const activeChallengeId = params.activeChallengeId ?? "";
  const taskId = params.taskId ?? "";
  const challengeId = params.challengeId ?? "";
  const title = params.title ?? "Starter";
  const taskTitle = params.taskTitle ?? "Complete your first task";
  const hasRealTask = !!(activeChallengeId && taskId);

  const handleImReady = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWinStep(2);
  }, []);

  const handleMarkComplete = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      if (hasRealTask) {
        await completeTask({ activeChallengeId, taskId });
        await refetchAll();
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
      setShowCelebration(true);
    } catch (e: unknown) {
      Alert.alert("Error", (e as Error)?.message ?? "Could not save completion.");
    } finally {
      setCompleting(false);
    }
  }, [hasRealTask, activeChallengeId, taskId, challengeId, completeTask, refetchAll, params.starterId, params.primaryGoal, params.dailyTimeBudget, completing]);

  const handleIntentionDone = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTaskCompleted(true);
    const ttfv = await getDay1TtfvSeconds();
    track({
      name: "day1_task_completed",
      challengeId: challengeId || "intention",
      ...(ttfv != null && { ttfv_seconds: ttfv }),
    });
    setShowCelebration(true);
    setCompleting(false);
  }, [challengeId, completing]);

  const handleLetsKeepGoing = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCelebration(false);
    await setFirstSessionJustFinished();
    try {
      const dismissed = await AsyncStorage.getItem(ACCOUNTABILITY_PROMPT_DISMISSED_KEY);
      if (dismissed === "1") {
        router.replace(ROUTES.TABS as never);
        return;
      }
      setShowAccountabilityPrompt(true);
    } catch {
      router.replace(ROUTES.TABS as never);
    }
  }, [router]);

  const handleAccountabilityAdd = useCallback(async () => {
    await AsyncStorage.setItem(ACCOUNTABILITY_PROMPT_DISMISSED_KEY, "1");
    setShowAccountabilityPrompt(false);
    router.replace(ROUTES.ACCOUNTABILITY_ADD_DAY1 as never);
  }, [router]);

  const handleAccountabilityNotNow = useCallback(async () => {
    await AsyncStorage.setItem(ACCOUNTABILITY_PROMPT_DISMISSED_KEY, "1");
    setShowAccountabilityPrompt(false);
    router.replace(ROUTES.TABS as never);
  }, [router]);

  const bg = themeColors.background;
  const textPrimary = themeColors.text.primary ?? colors.textPrimary;
  const textSecondary = themeColors.text.secondary ?? colors.textSecondary;
  const surface = themeColors.card ?? colors.surface;
  const borderSubtle = themeColors.border ?? colors.borderSubtle;
  const accentOrange = themeColors.accent ?? colors.accentOrange;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: bg }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {winStep === 1 && (
          <View style={s.content}>
            <Text style={[s.missionHeader, { color: textPrimary }]}>Let&apos;s secure your first win</Text>
            <Text style={[s.missionBody, { color: textSecondary }]}>
              Discipline isn&apos;t built in a day. It&apos;s built one task at a time. Let&apos;s start right now.
            </Text>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: accentOrange }]} onPress={handleImReady} activeOpacity={0.85} accessibilityLabel="I'm ready to start" accessibilityRole="button">
              <Text style={s.primaryBtnText}>I&apos;m Ready</Text>
            </TouchableOpacity>
          </View>
        )}

        {winStep === 2 && (
          <View style={s.content}>
            <Text style={[s.dayLabel, { color: textSecondary }]}>Day 1</Text>
            <Text style={[s.title, { color: textPrimary }]}>{title}</Text>

            {hasRealTask ? (
              <View style={[s.taskCard, { backgroundColor: surface, borderColor: borderSubtle }]}>
                <Text style={[s.taskTitle, { color: textPrimary }]}>{taskTitle}</Text>
                {taskCompleted ? (
                  <View style={s.completedRow}>
                    <CheckCircle2 size={22} color={colors.successGreenText} fill={colors.successGreenText} strokeWidth={0} />
                    <Text style={s.completedText}>Done</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[s.markCompleteBtn, { backgroundColor: accentOrange }]}
                    onPress={handleMarkComplete}
                    disabled={completing}
                    activeOpacity={0.85}
                    accessibilityLabel="Mark task complete"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: completing }}
                  >
                    <Text style={s.markCompleteBtnText}>Mark complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={[s.taskCard, { backgroundColor: surface, borderColor: borderSubtle }]}>
                <Text style={[s.taskTitle, { color: textPrimary }]}>Take a moment to set your intention for today</Text>
                <Text style={[s.intentionLabel, { color: textSecondary }]}>What&apos;s one thing you want to accomplish today?</Text>
                <TextInput
                  style={[s.intentionInput, { color: textPrimary, borderColor: borderSubtle }]}
                  placeholder="e.g. Finish my workout"
                  placeholderTextColor={textSecondary}
                  value={intentionText}
                  onChangeText={setIntentionText}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity
                  style={[s.markCompleteBtn, { backgroundColor: accentOrange }]}
                  onPress={handleIntentionDone}
                  disabled={completing}
                  activeOpacity={0.85}
                >
                  <Text style={s.markCompleteBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {showCelebration && (
          <>
            <Celebration
              visible={true}
              onComplete={() => {}}
              titleText="FIRST WIN! 🔥"
              streakCount={1}
            />
            <View style={s.celebrationCtaWrap} pointerEvents="box-none">
              <Text style={[s.celebrationMessage, { color: textSecondary }]}>
                You just completed your first task on GRIIT.
              </Text>
              <Text style={[s.celebrationStreak, { color: textPrimary }]}>Day 1 — Your streak starts now</Text>
              <TouchableOpacity
                style={[s.primaryBtn, s.primaryBtnWide, { backgroundColor: accentOrange }]}
                onPress={handleLetsKeepGoing}
                activeOpacity={0.85}
                accessibilityLabel="Let's keep going"
                accessibilityRole="button"
              >
                <Text style={s.primaryBtnText}>Let&apos;s Keep Going</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      <Modal visible={showAccountabilityPrompt} transparent animationType="fade">
        <View style={s.celebrationBackdrop}>
          <View style={[s.celebrationCard, { backgroundColor: surface }]}>
            <Text style={[s.celebrationTitle, { color: textPrimary }]}>Want to make this easier to stick to?</Text>
            <Text style={[s.celebrationSub, { color: textSecondary }]}>
              Add an accountability partner and stay on track together.
            </Text>
            <TouchableOpacity style={[s.goHomeBtn, { backgroundColor: accentOrange }]} onPress={handleAccountabilityAdd} activeOpacity={0.85} accessibilityLabel="Add accountability partner" accessibilityRole="button">
              <Text style={s.goHomeBtnText}>Add accountability partner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryBtn} onPress={handleAccountabilityNotNow} activeOpacity={0.85} accessibilityLabel="Not now" accessibilityRole="button">
              <Text style={[s.secondaryBtnText, { color: textSecondary }]}>Not now</Text>
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
  },
  flex1: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 40,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  missionHeader: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  missionBody: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  taskCard: {
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  intentionLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 10,
  },
  intentionInput: {
    borderWidth: 1,
    borderRadius: radius.tag,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
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
  },
  markCompleteBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: radius.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primaryBtnWide: {
    width: "100%",
    maxWidth: 280,
    marginTop: 16,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  celebrationCtaWrap: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  celebrationMessage: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 6,
  },
  celebrationStreak: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  celebrationCard: {
    borderRadius: radius.cardLarge,
    padding: 32,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  celebrationSub: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  goHomeBtn: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.primaryButton,
    width: "100%",
    alignItems: "center",
  },
  goHomeBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
