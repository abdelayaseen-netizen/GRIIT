import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TwoColOptionCard } from "@/components/onboarding/TwoColOptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { SOCIAL_OPTIONS, TRAINING_TIMES } from "@/constants/onboardingData";
import { DS_COLORS } from "@/lib/design-system";

export default function OnboardingSocialScreen() {
  const router = useRouter();
  const socialStyle = useOnboardingStore((s) => s.socialStyle);
  const trainingTime = useOnboardingStore((s) => s.trainingTime);
  const setSocialStyle = useOnboardingStore((s) => s.setSocialStyle);
  const setTrainingTime = useOnboardingStore((s) => s.setTrainingTime);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleContinue = () => {
    if (!socialStyle) return;
    if (!trainingTime) setTrainingTime("whenever");
    router.push("/onboarding/proof" as never);
  };

  return (
    <OnboardingLayout
      step={5}
      totalSteps={9}
      showBack={true}
      showSkip={true}
      showProgressBar={true}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How do you want to show up on GRIIT?</Text>
        <Text style={styles.subtitle}>You can change this anytime in settings.</Text>

        <View style={styles.grid}>
          {SOCIAL_OPTIONS.map((opt) => (
            <TwoColOptionCard
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              sub={opt.sub}
              selected={socialStyle === opt.id}
              onPress={() => setSocialStyle(opt.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>When do you prefer to do your tasks?</Text>
        <View style={styles.timeRow}>
          {TRAINING_TIMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.timeChip,
                trainingTime === t.id && styles.timeChipActive,
              ]}
              onPress={() => setTrainingTime(t.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.timeChipText,
                  trainingTime === t.id && styles.timeChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.cta, !socialStyle && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!socialStyle}
          activeOpacity={0.9}
        >
          <Text style={[styles.ctaText, !socialStyle && styles.ctaTextDisabled]}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  timeChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: DS_COLORS.background,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipActive: {
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.accent,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.textSecondary,
  },
  timeChipTextActive: {
    color: DS_COLORS.white,
  },
  cta: {
    backgroundColor: DS_COLORS.accent,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.border,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  ctaTextDisabled: {
    color: DS_COLORS.textSecondary,
  },
});
