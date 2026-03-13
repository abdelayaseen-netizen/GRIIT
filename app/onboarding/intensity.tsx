import React, { useEffect } from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { INTENSITY_OPTIONS } from "@/constants/onboardingData";
import type { OnboardingIntensity } from "@/store/onboardingStore";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";

export default function OnboardingIntensityScreen() {
  const router = useRouter();
  const intensity = useOnboardingStore((s) => s.intensity);
  const setIntensity = useOnboardingStore((s) => s.setIntensity);

  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  useEffect(() => {
    const pushDefault = useOnboardingStore.getState().intensity;
    if (pushDefault === null) {
      setIntensity("push");
    }
  }, [setIntensity]);

  const handleContinue = () => {
    if (!intensity) return;
    router.push("/onboarding/social" as never);
  };

  return (
    <OnboardingLayout
      step={4}
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
        <Text style={styles.title}>How hard do you want GRIIT to push you?</Text>

        {INTENSITY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            label={opt.label}
            sub={opt.sub}
            selected={intensity === opt.id}
            onPress={() => setIntensity(opt.id as OnboardingIntensity)}
            badge={opt.isDefault ? "Most popular" : undefined}
          />
        ))}

        <TouchableOpacity
          style={[styles.cta, !intensity && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!intensity}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>This is my level</Text>
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
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  cta: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
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
