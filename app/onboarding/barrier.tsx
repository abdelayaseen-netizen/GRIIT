import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { BARRIERS, BARRIER_EMPATHY } from "@/constants/onboardingData";
import { DS_COLORS } from "@/lib/design-system";

export default function OnboardingBarrierScreen() {
  const router = useRouter();
  const barrier = useOnboardingStore((s) => s.barrier);
  const setBarrier = useOnboardingStore((s) => s.setBarrier);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const empathyOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  useEffect(() => {
    if (barrier) {
      Animated.timing(empathyOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      empathyOpacity.setValue(0);
    }
  }, [barrier, empathyOpacity]);

  const handleContinue = () => {
    if (!barrier) return;
    router.push("/onboarding/intensity" as never);
  };

  const empathyLine = barrier ? BARRIER_EMPATHY[barrier] : null;

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
            selected={barrier === b.id}
            onPress={() => setBarrier(b.id)}
          />
        ))}

        {empathyLine ? (
          <Animated.View style={[styles.empathyWrap, { opacity: empathyOpacity }]}>
            <Text style={styles.empathy}>{empathyLine}</Text>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          style={[styles.cta, !barrier && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!barrier}
          activeOpacity={0.9}
          accessibilityLabel="Continue to next step"
          accessibilityRole="button"
          accessibilityState={{ disabled: !barrier }}
        >
          <Text style={styles.ctaText}>That&apos;s my truth — let&apos;s go</Text>
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
  empathyWrap: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  empathy: {
    fontSize: 15,
    fontStyle: "italic",
    color: DS_COLORS.accent,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: DS_COLORS.accent,
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
    color: DS_COLORS.onboardingBg,
  },
});
