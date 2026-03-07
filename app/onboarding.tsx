import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { trpcMutate } from "@/lib/trpc";
import { saveJoinedStarterId, setDay1StartedAt } from "@/lib/starter-join";
import { filterOnboardingStarters, type OnboardingStarter } from "@/lib/onboarding-starters";
import { track } from "@/lib/analytics";

const GOAL_OPTIONS = ["Fitness", "Mind", "Faith", "Discipline", "Other"];
const TIME_OPTIONS = ["3 min", "10 min", "20+ min"];

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (params.step === "4") setStep(4);
  }, [params.step]);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [dailyTimeBudget, setDailyTimeBudget] = useState("");
  const [selectedStarter, setSelectedStarter] = useState<OnboardingStarter | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNextStep3 = useCallback(() => {
    if (!selectedStarter) return;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 3, total: 4 });
    setStep(4);
  }, [selectedStarter]);

  const starters = filterOnboardingStarters(primaryGoal, dailyTimeBudget);

  const handleNextStep1 = useCallback(() => {
    if (!primaryGoal) return;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 1, total: 3 });
    setStep(2);
  }, [primaryGoal]);

  const handleNextStep2 = useCallback(() => {
    if (!dailyTimeBudget) return;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 2, total: 3 });
    setStep(3);
  }, [dailyTimeBudget]);

  const handleStartDay1 = useCallback(async () => {
    if (!selectedStarter || submitting) return;
    setSubmitting(true);
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      track({ name: "starter_challenge_selected", challengeId: selectedStarter.id });
      const joinResult = await trpcMutate("starters.join", { starterId: selectedStarter.id }) as { activeChallengeId: string; taskId: string; challengeId: string };
      await saveJoinedStarterId(selectedStarter.id);
      await trpcMutate("profiles.update", {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        primary_goal: primaryGoal || undefined,
        daily_time_budget: dailyTimeBudget || undefined,
        starter_challenge_id: selectedStarter.id,
      });
      track({ name: "onboarding_step_completed", step: 4, total: 4 });
      await setDay1StartedAt();
      router.replace({
        pathname: "/day1-quick-win",
        params: {
          activeChallengeId: joinResult.activeChallengeId,
          taskId: joinResult.taskId,
          challengeId: joinResult.challengeId,
          title: selectedStarter.title,
          taskTitle: selectedStarter.taskTitle,
          taskType: selectedStarter.taskType,
          starterId: selectedStarter.id,
          primaryGoal: primaryGoal || undefined,
          dailyTimeBudget: dailyTimeBudget || undefined,
        },
      } as any);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedStarter, primaryGoal, dailyTimeBudget, submitting, router]);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.progressRow}>
        <Text style={s.progressText}>{step}/4</Text>
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>What are you here to build?</Text>
          <View style={s.chipRow}>
            {GOAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, primaryGoal === opt && s.chipActive]}
                onPress={() => {
                  setPrimaryGoal(opt);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, primaryGoal === opt && s.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.primaryBtn, !primaryGoal && s.primaryBtnDisabled]}
            onPress={handleNextStep1}
            disabled={!primaryGoal}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>How much time can you give daily?</Text>
          <View style={s.chipRow}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, dailyTimeBudget === opt && s.chipActive]}
                onPress={() => {
                  setDailyTimeBudget(opt);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, dailyTimeBudget === opt && s.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.primaryBtn, !dailyTimeBudget && s.primaryBtnDisabled]}
            onPress={handleNextStep2}
            disabled={!dailyTimeBudget}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Pick a starter challenge</Text>
          <Text style={s.subtitle}>One task. One day. You’ve got this.</Text>
          <View style={s.cardList}>
            {starters.slice(0, 6).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.card, selectedStarter?.id === c.id && s.cardActive]}
                onPress={() => {
                  setSelectedStarter(c);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.85}
              >
                <Text style={s.cardTitle}>{c.title}</Text>
                <Text style={s.cardDesc}>{c.description}</Text>
                <Text style={s.cardMeta}>{c.taskTitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.primaryBtn, !selectedStarter && s.primaryBtnDisabled]}
            onPress={handleNextStep3}
            disabled={!selectedStarter}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 4 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Build with someone</Text>
          <Text style={s.subtitle}>Add 1 accountability partner (optional)</Text>
          <TouchableOpacity
            style={[s.primaryBtn, s.primaryBtnMargin]}
            onPress={() => router.push("/accountability/add?from=onboarding" as any)}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Add partner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={handleStartDay1}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <Text style={s.secondaryBtnText}>Skip for now</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressRow: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.tag,
    backgroundColor: colors.chipFill,
    borderWidth: 1,
    borderColor: colors.chipStroke,
  },
  chipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  chipText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.chipText,
  },
  chipTextActive: {
    color: colors.white,
  },
  cardList: {
    gap: 12,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardActive: {
    borderColor: colors.accentOrange,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.chipText,
  },
  primaryBtn: {
    backgroundColor: colors.accentOrange,
    paddingVertical: 18,
    borderRadius: radius.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  primaryBtnMargin: {
    marginBottom: 12,
  },
  secondaryBtn: {
    paddingVertical: 18,
    borderRadius: radius.primaryButton,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    backgroundColor: colors.chipFill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
