import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { BARRIERS, BARRIER_EMPATHY } from "@/constants/onboardingData";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

export default function OnboardingBarrierScreen() {
  const router = useRouter();
  const barrier = useOnboardingStore((s) => s.barrier);
  const setBarrier = useOnboardingStore((s) => s.setBarrier);

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
          <View style={styles.empathyWrap}>
            <Text style={styles.empathy}>{empathyLine}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.cta, !barrier && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!barrier}
          activeOpacity={0.9}
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
    color: TEXT_PRIMARY,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
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
    color: ACCENT,
    lineHeight: 22,
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
