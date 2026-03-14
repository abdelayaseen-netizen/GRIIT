import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { BARRIERS, BARRIER_EMPATHY } from "@/constants/onboardingData";
import { DS_COLORS } from "@/lib/design-system";

const EMPATHY_FALLBACK = "Perfect. We'll start you with a challenge built for day one.";

export default function OnboardingBarrierScreen() {
  const router = useRouter();
  const barriers = useOnboardingStore((s) => s.barriers);
  const toggleBarrier = useOnboardingStore((s) => s.toggleBarrier);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const empathyOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  useEffect(() => {
    if (barriers.length > 0) {
      Animated.timing(empathyOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      empathyOpacity.setValue(0);
    }
  }, [barriers.length, empathyOpacity]);

  const handleContinue = () => {
    if (barriers.length === 0) return;
    router.push("/onboarding/intensity" as never);
  };

  const empathyLine =
    barriers.length > 0
      ? BARRIER_EMPATHY[barriers[0]] ?? EMPATHY_FALLBACK
      : null;

  return (
    <OnboardingLayout
      step={3}
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
        <Text style={styles.title}>What&apos;s gotten in the way before?</Text>
        <Text style={styles.subtitle}>Be honest — we&apos;ve heard it all.</Text>

        {BARRIERS.map((b) => (
          <OptionCard
            key={b.id}
            icon={b.icon}
            label={b.label}
            sub={b.sub}
            selected={barriers.includes(b.id)}
            onPress={() => toggleBarrier(b.id)}
          />
        ))}

        {empathyLine ? (
          <Animated.View style={[styles.empathyWrap, { opacity: empathyOpacity }]}>
            <Text style={styles.empathy}>{empathyLine}</Text>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          style={[styles.cta, barriers.length === 0 && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={barriers.length === 0}
          activeOpacity={0.9}
          accessibilityLabel="Continue to next step"
          accessibilityRole="button"
          accessibilityState={{ disabled: barriers.length === 0 }}
        >
          <Text style={[styles.ctaText, barriers.length === 0 && styles.ctaTextDisabled]}>
            That&apos;s my truth — let&apos;s go
          </Text>
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
    marginBottom: 28,
  },
  empathyWrap: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  empathy: {
    fontSize: 13,
    fontStyle: "italic",
    color: DS_COLORS.accent,
    lineHeight: 20,
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
