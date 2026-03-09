import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/src/theme/tokens";
import { setOnboardingAnswers, setPendingChallengeId, type OnboardingAnswers } from "@/lib/onboarding-pending";

const MAIN_GOAL_OPTIONS = [
  "Build discipline",
  "Get fit",
  "Improve mindset",
  "Break bad habits",
  "All of the above",
];

const FOCUS_OPTIONS = [
  "Fitness",
  "Mental health",
  "Productivity",
  "Diet & nutrition",
  "Social accountability",
];

const DAYS_PER_WEEK_OPTIONS = ["3 days", "5 days", "Every day"];

const CHALLENGE_PREFERENCE_OPTIONS = ["Solo", "With friends", "Both"];

export default function OnboardingQuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ challengeId?: string }>();
  const challengeId = typeof params.challengeId === "string" ? params.challengeId : undefined;

  const [step, setStep] = useState(1);
  const [mainGoal, setMainGoal] = useState("");
  const [focus, setFocus] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [challengePreference, setChallengePreference] = useState("");

  const canNext =
    (step === 1 && mainGoal) ||
    (step === 2 && focus) ||
    (step === 3 && daysPerWeek) ||
    (step === 4 && challengePreference);

  const handleNext = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    const answers: OnboardingAnswers = {
      main_goal: mainGoal || undefined,
      focus: focus || undefined,
      days_per_week: daysPerWeek || undefined,
      challenge_preference: challengePreference || undefined,
    };
    await setOnboardingAnswers(answers);
    if (challengeId) await setPendingChallengeId(challengeId);
    router.replace("/auth/signup" as any);
  }, [step, mainGoal, focus, daysPerWeek, challengePreference, challengeId, router]);

  const { width } = useWindowDimensions();
  const isNarrow = width < 380;

  const renderOptions = (options: string[], value: string, setValue: (s: string) => void) => (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setValue(opt);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const titles = [
    "What's your main goal?",
    "What do you want to focus on?",
    "How many days per week can you commit?",
    "Do you prefer solo or group challenges?",
  ];
  const subtitles = [
    "We'll tailor your experience.",
    "Pick your priority area.",
    "Consistency beats intensity.",
    "We support both.",
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.progressRow}>
        <View style={styles.progressDots}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.progressDot, i === step && styles.progressDotActive]} />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isNarrow && styles.scrollContentNarrow]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{titles[step - 1]}</Text>
        <Text style={styles.subtitle}>{subtitles[step - 1]}</Text>

        {step === 1 && renderOptions(MAIN_GOAL_OPTIONS, mainGoal, setMainGoal)}
        {step === 2 && renderOptions(FOCUS_OPTIONS, focus, setFocus)}
        {step === 3 && renderOptions(DAYS_PER_WEEK_OPTIONS, daysPerWeek, setDaysPerWeek)}
        {step === 4 && renderOptions(CHALLENGE_PREFERENCE_OPTIONS, challengePreference, setChallengePreference)}

        <TouchableOpacity
          style={[styles.primaryBtn, !canNext && styles.primaryBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>{step === 4 ? "Continue to sign up" : "Next"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scrollContentNarrow: {
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 24,
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
});
