/**
 * OnboardingFlowV2 — the new 9-screen onboarding flow.
 *
 * Rendered by app/onboarding/index.tsx ONLY when FLAGS.ONBOARDING_V2 is true.
 * Runs alongside (never replaces) the existing components/onboarding/OnboardingFlow.
 *
 * Screen registry is built up phase-by-phase. Steps 0–6 + 8 render in-flow;
 * the paywall (mockup 08) is the existing offering-driven /paywall route,
 * presented between Account and First-challenge.
 */
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { OBV2_COLOR, OBV2_TYPE } from "./theme";

/** In-flow step keys (paywall is a pushed route, not an in-flow step). */
export type OnboardingV2Step =
  | "welcome"
  | "why_proof"
  | "why_circle"
  | "goals"
  | "commitment"
  | "reminders"
  | "account"
  | "first_challenge";

export default function OnboardingFlowV2() {
  const [step] = useState<OnboardingV2Step>("welcome");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Onboarding v2 — {step}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: OBV2_COLOR.screen },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { ...OBV2_TYPE.body, color: OBV2_COLOR.ink2 },
});
