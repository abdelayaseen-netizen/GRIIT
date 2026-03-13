/**
 * Onboarding — POST-SIGNUP (required).
 * Premium flow: Welcome, How heard, Notifications, Goal, Time, Pick challenge, Done.
 * Uses design system: GRIIT wordmark, slim progress, selection cards, anchored CTA.
 */
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_RADIUS, DS_BORDERS } from "@/lib/design-system";
import {
  GRIITWordmark,
  OnboardingProgress,
  OnboardingCTA,
  SelectionCard,
} from "@/src/components/ui";
import { trpcMutate } from "@/lib/trpc";
import { saveJoinedStarterId, setDay1StartedAt } from "@/lib/starter-join";
import { filterOnboardingStarters, type OnboardingStarter } from "@/lib/onboarding-starters";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

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
      <Text style={s.eyebrow}>YOU&apos;RE IN</Text>
      <Text style={s.title}>You&apos;re all set.</Text>
      <Text style={s.subtitle}>Your first challenge is ready. Secure your day.</Text>
      <OnboardingCTA label="Start Day 1" onPress={handlePress} variant="black" />
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
  const [_joinResult, setJoinResult] = useState<{ activeChallengeId: string; taskId: string; challengeId: string } | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = (user?.user_metadata as Record<string, unknown>)?.display_name;
      if (typeof name === "string" && name.trim()) setDisplayName(name.trim());
    }).catch(() => {});
  }, []);

  const goToHome = useCallback(() => {
    router.replace(ROUTES.TABS as never);
  }, [router]);

  const requestNotificationPermission = useCallback(async () => {
    try {
      await Notifications.requestPermissionsAsync();
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
  const insets = useSafeAreaInsets();
  const topInset = insets.top + DS_SPACING.sm;
  const bottomInset = insets.bottom + DS_SPACING.lg;

  function renderChips(
    options: string[],
    value: string,
    onSelect: (v: string) => void
  ) {
    return (
      <View style={s.chipRow}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[s.chip, selected && s.chipActive]}
              onPress={() => {
                onSelect(opt);
                if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, selected && s.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const content = (
    <>
      {step === 1 && (
        <>
          <Text style={s.eyebrow}>WELCOME</Text>
          <Text style={s.title}>
            Welcome to GRIIT{displayName ? `, ${displayName}` : ""}.
          </Text>
          <Text style={s.subtitle}>
            Let&apos;s personalize your experience. This takes about 60 seconds.
          </Text>
          <OnboardingCTA label="Get Started" onPress={handleNextStep1} variant="black" />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={s.eyebrow}>OPTIONAL</Text>
          <Text style={s.title}>How did you hear about us?</Text>
          <Text style={s.subtitle}>Helps us improve.</Text>
          {renderChips(HOW_HEARD_OPTIONS, howHeard, setHowHeard)}
          <OnboardingCTA label="Next" onPress={handleNextStep2} variant="black" />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={s.eyebrow}>REMINDERS</Text>
          <Text style={s.title}>How would you like to be reminded?</Text>
          <Text style={s.subtitle}>We&apos;ll ask for notification permission.</Text>
          {renderChips(NOTIFICATION_OPTIONS, notificationPreference, setNotificationPreference)}
          <OnboardingCTA label="Next" onPress={handleNextStep3} variant="black" />
        </>
      )}

      {step === 4 && (
        <>
          <Text style={s.eyebrow}>IDENTITY</Text>
          <Text style={s.title}>What drives you?</Text>
          <Text style={s.subtitle}>No one&apos;s coming to save you. You have to do it yourself.</Text>
          {renderChips(GOAL_OPTIONS, primaryGoal, setPrimaryGoal)}
          <OnboardingCTA
            label="Next"
            onPress={handleNextStep4}
            variant="black"
            disabled={!primaryGoal}
          />
        </>
      )}

      {step === 5 && (
        <>
          <Text style={s.eyebrow}>TIME</Text>
          <Text style={s.title}>How much time do you have?</Text>
          <Text style={s.subtitle}>Even 3 minutes of discipline beats zero.</Text>
          {renderChips(TIME_OPTIONS, dailyTimeBudget, setDailyTimeBudget)}
          <OnboardingCTA
            label="Next"
            onPress={handleNextStep5}
            variant="black"
            disabled={!dailyTimeBudget}
          />
        </>
      )}

      {step === 6 && (
        <>
          <Text style={s.eyebrow}>DAY 1</Text>
          <Text style={s.title}>Pick your first challenge</Text>
          <Text style={s.subtitle}>This is Day 1. Pick one and commit.</Text>
          <View style={s.cardList}>
            {starters.slice(0, 6).map((c) => (
              <SelectionCard
                key={c.id}
                title={c.title}
                subtitle={c.taskTitle ? `${c.taskTitle} · ${c.description || ""}` : c.description}
                selected={selectedStarter?.id === c.id}
                onPress={() => {
                  setSelectedStarter(c);
                  if (typeof Haptics?.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                showCheck={true}
              />
            ))}
          </View>
          <OnboardingCTA
            label="Continue"
            onPress={handleNextStep6}
            variant="black"
            disabled={!selectedStarter}
            loading={submitting}
          />
        </>
      )}

      {step === 7 && <OnboardingDoneStep onContinue={goToHome} />}
    </>
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <View style={[s.header, { paddingTop: topInset }]}>
        {step > 1 ? (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            style={s.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={s.wordmarkWrap}>
            <GRIITWordmark subtitle="" compact />
          </View>
        )}
        <OnboardingProgress step={step} total={TOTAL_STEPS} />
      </View>

      {step === 1 && (
        <TouchableOpacity
          onPress={() => setStep(4)}
          style={[s.skipLink, { top: topInset }]}
          activeOpacity={0.7}
        >
          <Text style={s.skipLinkText}>Skip</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[s.scrollContent, { paddingBottom: bottomInset + DS_SPACING.section }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingBottom: DS_SPACING.md,
  },
  backButton: {
    padding: DS_SPACING.sm,
  },
  wordmarkWrap: {},
  skipLink: {
    position: "absolute",
    right: DS_SPACING.screenHorizontal,
    zIndex: 10,
    padding: DS_SPACING.sm,
  },
  skipLinkText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.sectionGap,
  },
  eyebrow: {
    fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
    fontWeight: DS_TYPOGRAPHY.eyebrow.fontWeight,
    letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
    color: DS_COLORS.accent,
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.pageTitle.fontWeight,
    letterSpacing: DS_TYPOGRAPHY.pageTitle.letterSpacing,
    lineHeight: DS_TYPOGRAPHY.pageTitle.lineHeight,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.md,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    lineHeight: DS_TYPOGRAPHY.bodySmall.lineHeight,
    color: DS_COLORS.textSecondary,
    marginBottom: DS_SPACING.xxl,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sectionGap,
  },
  chip: {
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.xl,
    borderRadius: DS_RADIUS.chip,
    backgroundColor: DS_COLORS.chipFill,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.chipStroke,
  },
  chipActive: {
    backgroundColor: DS_COLORS.black,
    borderColor: DS_COLORS.black,
  },
  chipText: {
    fontSize: DS_TYPOGRAPHY.chip.fontSize,
    fontWeight: DS_TYPOGRAPHY.chip.fontWeight,
    color: DS_COLORS.textSecondary,
  },
  chipTextActive: {
    color: DS_COLORS.white,
  },
  cardList: {
    marginBottom: DS_SPACING.sectionGap,
  },
});
