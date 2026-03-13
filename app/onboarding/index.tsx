import React, { useEffect } from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { MOTIVATIONS } from "@/constants/onboardingData";
import { DS_COLORS } from "@/lib/design-system";

export default function OnboardingHookScreen() {
  const router = useRouter();
  const motivation = useOnboardingStore((s) => s.motivation);
  const setMotivation = useOnboardingStore((s) => s.setMotivation);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleContinue = () => {
    if (!motivation) return;
    router.push("/onboarding/identity" as never);
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={9}
      showBack={false}
      showSkip={false}
      showProgressBar={true}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>What brought you to GRIIT?</Text>
        <Text style={styles.subtitle}>We&apos;ll build your plan around this.</Text>

        {MOTIVATIONS.map((m) => (
          <OptionCard
            key={m.id}
            icon={m.icon}
            label={m.label}
            sub={m.sub}
            selected={motivation === m.id}
            onPress={() => setMotivation(m.id)}
          />
        ))}

        <TouchableOpacity
          style={[styles.cta, !motivation && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!motivation}
          activeOpacity={0.9}
          accessibilityLabel="Continue to next step"
          accessibilityRole="button"
          accessibilityState={{ disabled: !motivation }}
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
    color: DS_COLORS.white,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: DS_COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 28,
  },
  cta: {
    backgroundColor: DS_COLORS.accent,
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
    color: DS_COLORS.onboardingBg,
  },
});
