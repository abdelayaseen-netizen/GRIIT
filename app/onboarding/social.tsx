import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TwoColOptionCard } from "@/components/onboarding/TwoColOptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { SOCIAL_OPTIONS, TRAINING_TIMES } from "@/constants/onboardingData";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

export default function OnboardingSocialScreen() {
  const router = useRouter();
  const socialStyle = useOnboardingStore((s) => s.socialStyle);
  const trainingTime = useOnboardingStore((s) => s.trainingTime);
  const setSocialStyle = useOnboardingStore((s) => s.setSocialStyle);
  const setTrainingTime = useOnboardingStore((s) => s.setTrainingTime);

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
                {t.icon} {t.label}
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
          <Text style={styles.ctaText}>Continue</Text>
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
    color: TEXT_PRIMARY,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    lineHeight: 24,
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
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
  },
  timeChipActive: {
    borderColor: ACCENT,
    backgroundColor: "#1A1A1A",
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  timeChipTextActive: {
    color: ACCENT,
  },
  cta: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A0A0A",
  },
});
