import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TwoColOptionCard } from "@/components/onboarding/TwoColOptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { PERSONAS } from "@/constants/onboardingData";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

export default function OnboardingIdentityScreen() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const setPersona = useOnboardingStore((s) => s.setPersona);

  const handleContinue = () => {
    if (!persona) return;
    router.push("/onboarding/barrier" as never);
  };

  return (
    <OnboardingLayout
      step={2}
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
        <Text style={styles.title}>Who are you training as right now?</Text>
        <Text style={styles.subtitle}>This shapes your challenge feed.</Text>

        <View style={styles.grid}>
          {PERSONAS.map((p) => (
            <TwoColOptionCard
              key={p.id}
              icon={p.icon}
              label={p.label}
              sub={p.sub}
              selected={persona === p.id}
              onPress={() => setPersona(p.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.cta, !persona && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!persona}
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
    marginBottom: 24,
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
