/**
 * Onboarding — POST-SIGNUP (required).
 * Shown after create-profile when onboarding_completed is false. 7 steps: Welcome,
 * How heard, Notifications, Goal, Time, Pick challenge, Done. Persists to Supabase
 * via profiles.update (onboarding_completed, onboarding_answers, primary_goal,
 * daily_time_budget, starter_challenge_id) and calls starters.join for the chosen
 * starter. This is the canonical place where onboarding_completed is set to true.
 * See onboarding-questions.tsx for the optional pre-signup flow (AsyncStorage only).
 */
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { trpcMutate } from "@/lib/trpc";
import { saveJoinedStarterId, setDay1StartedAt } from "@/lib/starter-join";
import { filterOnboardingStarters, type OnboardingStarter } from "@/lib/onboarding-starters";
import { getPendingChallengeId, setPendingChallengeId } from "@/lib/onboarding-pending";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";

const HOW_HEARD_OPTIONS = ["Friend", "Social media", "App Store", "YouTube", "Podcast", "Other"];
const NOTIFICATION_OPTIONS = ["Daily", "Weekly", "Don't remind me"];
const GOAL_OPTIONS = ["Fitness", "Mind", "Faith", "Discipline", "Other"];
const TIME_OPTIONS = ["3 min", "10 min", "20+ min"];
const TOTAL_STEPS = 7;

function OnboardingDoneStep({ onContinue }: { onContinue: () => void }) {
  const doneRef = useRef(false);
  const handlePress = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  }, [onContinue]);
  return (
    <>
      <Text style={s.title}>You{"'"}re all set! 🎉</Text>
      <Text style={s.subtitle}>Your first challenge is ready. Secure your day.</Text>
      <TouchableOpacity style={[s.primaryBtn, s.primaryBtnMargin]} onPress={handlePress} activeOpacity={0.85}>
        <Text style={s.primaryBtnText}>Let{"'"}s go</Text>
      </TouchableOpacity>
    </>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (params.step === "4") setStep(4);
  }, [params.step]);
  const [howHeard, setHowHeard] = useState("");
  const [notificationPreference, setNotificationPreference] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [dailyTimeBudget, setDailyTimeBudget] = useState("");
  const [selectedStarter, setSelectedStarter] = useState<OnboardingStarter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [joinResult, setJoinResult] = useState<{ activeChallengeId: string; taskId: string; challengeId: string } | null>(null);

  const goToDay1QuickWin = useCallback(async () => {
    const pendingId = await getPendingChallengeId();
    if (pendingId) {
      await setPendingChallengeId(null);
      router.replace(ROUTES.CHALLENGE_ID(pendingId) as never);
      return;
    }
    if (!joinResult || !selectedStarter) {
      router.replace("/(tabs)" as never);
      return;
    }
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
    } as never);
  }, [joinResult, selectedStarter, primaryGoal, dailyTimeBudget, router]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (__DEV__) console.log("[Onboarding] notification permission:", status);
    } catch {
      // ignore
    }
  }, []);

  const handleNextStep1 = useCallback(() => {
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 1, total: TOTAL_STEPS });
    setStep(2);
  }, []);

  const handleNextStep2 = useCallback(() => {
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 2, total: TOTAL_STEPS });
    setStep(3);
  }, []);

  const handleNextStep3 = useCallback(async () => {
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await requestNotificationPermission();
    track({ name: "onboarding_step_completed", step: 3, total: TOTAL_STEPS });
    setStep(4);
  }, [requestNotificationPermission]);

  const handleNextStep4 = useCallback(() => {
    if (!primaryGoal) return;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 4, total: TOTAL_STEPS });
    setStep(5);
  }, [primaryGoal]);

  const handleNextStep5 = useCallback(() => {
    if (!dailyTimeBudget) return;
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 5, total: TOTAL_STEPS });
    setStep(6);
  }, [dailyTimeBudget]);

  const handleNextStep6 = useCallback(async () => {
    if (!selectedStarter || submitting) return;
    setSubmitting(true);
    if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track({ name: "onboarding_step_completed", step: 6, total: TOTAL_STEPS });
    try {
      track({ name: "starter_challenge_selected", challengeId: selectedStarter.id });
      const result = await trpcMutate("starters.join", { starterId: selectedStarter.id }) as { activeChallengeId: string; taskId: string; challengeId: string };
      await saveJoinedStarterId(selectedStarter.id);
      await trpcMutate("profiles.update", {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_answers: {
          how_heard: howHeard || undefined,
          notification_preference: notificationPreference || undefined,
          primary_goal: primaryGoal || undefined,
          daily_time_budget: dailyTimeBudget || undefined,
        },
        primary_goal: primaryGoal || undefined,
        daily_time_budget: dailyTimeBudget || undefined,
        starter_challenge_id: selectedStarter.id,
      });
      track({ name: "onboarding_step_completed", step: 7, total: TOTAL_STEPS });
      await setDay1StartedAt();
      setJoinResult(result);
      setStep(7);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedStarter, primaryGoal, dailyTimeBudget, howHeard, notificationPreference, submitting]);

  const starters = filterOnboardingStarters(primaryGoal, dailyTimeBudget);

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={s.progressRow}>
        <View style={s.progressDots}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
            <View key={i} style={[s.progressDot, i === step && s.progressDotActive]} />
          ))}
        </View>
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Welcome to GRIIT</Text>
          <Text style={s.subtitle}>Build discipline, one day at a time.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={handleNextStep1} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Let{"'"}s set you up</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>How did you hear about us?</Text>
          <Text style={s.subtitle}>Optional — helps us improve.</Text>
          <View style={s.chipRow}>
            {HOW_HEARD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, howHeard === opt && s.chipActive]}
                onPress={() => {
                  setHowHeard(opt);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, howHeard === opt && s.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.primaryBtn} onPress={handleNextStep2} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>How would you like to be reminded?</Text>
          <Text style={s.subtitle}>We{"'"}ll ask for notification permission.</Text>
          <View style={s.chipRow}>
            {NOTIFICATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, notificationPreference === opt && s.chipActive]}
                onPress={() => {
                  setNotificationPreference(opt);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, notificationPreference === opt && s.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.primaryBtn} onPress={handleNextStep3} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 4 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>What drives you?</Text>
          <Text style={s.subtitle}>No one{"'"}s coming to save you. You have to do it yourself.</Text>
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
            onPress={handleNextStep4}
            disabled={!primaryGoal}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 5 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>How much time do you have?</Text>
          <Text style={s.subtitle}>Even 3 minutes of discipline beats zero.</Text>
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
            onPress={handleNextStep5}
            disabled={!dailyTimeBudget}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 6 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Pick your first challenge</Text>
          <Text style={s.subtitle}>This is Day 1. Pick one and commit.</Text>
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
            onPress={handleNextStep6}
            disabled={!selectedStarter}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 7 && (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <OnboardingDoneStep onContinue={goToDay1QuickWin} />
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
    alignItems: "center",
  },
  progressDots: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.chipFill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressDotActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
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
