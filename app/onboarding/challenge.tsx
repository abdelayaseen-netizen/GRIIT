import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { useOnboardingStore } from "@/store/onboardingStore";
import { STARTER_CHALLENGES } from "@/constants/onboardingData";
import type { OnboardingIntensity } from "@/store/onboardingStore";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";

function filterAndSortChallenges(intensity: OnboardingIntensity) {
  const list = [...STARTER_CHALLENGES];
  if (!intensity) return list;
  const order: Record<string, number> = {
    foundation: 0,
    push: 1,
    maximum: 2,
  };
  const level = order[intensity] ?? 1;
  return list.sort((a, b) => {
    const aDiff = Math.abs(
      (order[a.difficulty] ?? 1) - level
    );
    const bDiff = Math.abs(
      (order[b.difficulty] ?? 1) - level
    );
    return aDiff - bDiff;
  });
}

export default function OnboardingChallengeScreen() {
  const router = useRouter();
  const intensity = useOnboardingStore((s) => s.intensity);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const setSelectedChallenge = useOnboardingStore((s) => s.setSelectedChallenge);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const challenges = filterAndSortChallenges(intensity);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleSelect = (id: string) => {
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedChallenge(id);
    setConfirmed(true);
  };

  const handleLockIn = () => {
    if (!selectedChallengeId || saving) return;
    setSaving(true);
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSaving(false);
    setTimeout(() => {
      router.push("/onboarding/signup" as never);
    }, 600);
  };

  return (
    <OnboardingLayout
      step={7}
      totalSteps={9}
      showBack={true}
      showSkip={false}
      showProgressBar={true}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your first challenge — built for you</Text>
        <Text style={styles.subtitle}>
          Based on your answers, we picked these.
        </Text>

        {challenges.map((c) => (
          <OptionCard
            key={c.id}
            icon={c.icon}
            label={c.label}
            sub={`${c.tasks} · ${c.duration} days`}
            selected={selectedChallengeId === c.id}
            onPress={() => handleSelect(c.id)}
          />
        ))}

        {selectedChallengeId ? (
          <View style={styles.savedWrap}>
            <Text style={styles.savedText}>Challenge saved ✓</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.cta,
            (!selectedChallengeId || saving) && styles.ctaDisabled,
          ]}
          onPress={handleLockIn}
          disabled={!selectedChallengeId || saving}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>
            {confirmed ? "Locked in →" : "Lock it in →"}
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
  savedWrap: {
    marginBottom: 16,
    alignItems: "center",
  },
  savedText: {
    fontSize: 15,
    fontWeight: "700",
    color: ACCENT,
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
