import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GOAL_OPTIONS } from "@/components/onboarding/onboarding-theme";
import { useOnboardingStore } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton, ProgressBar } from "../ui";

// TODO(onboarding-v2): goals→pack mapping pending. selectedGoals is persisted to
// the store only and is NOT yet wired to challenge recommendations / the featured
// first challenge. Map the 5 OnboardingGoal values to challenge packs once that
// backend mapping is defined.
export default function GoalsScreen({ onContinue }: { onContinue: () => void }) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const toggleGoal = useOnboardingStore((s) => s.toggleGoal);

  const handleContinue = useCallback(() => {
    track({ name: "onboarding_goals_selected", goals: selectedGoals });
    onContinue();
  }, [selectedGoals, onContinue]);

  return (
    <View style={styles.content}>
      <ProgressBar done={3} style={styles.pbar} />
      <View style={styles.head}>
        <Text style={styles.h1}>What are you{"\n"}building?</Text>
        <Text style={styles.sub}>Pick a few. We&apos;ll line up the right challenges for you.</Text>
      </View>

      <View style={styles.chips}>
        {GOAL_OPTIONS.map((g) => {
          const on = selectedGoals.includes(g.id);
          return (
            <Pressable
              key={g.id}
              onPress={() => toggleGoal(g.id)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={g.title}
            >
              <View style={[styles.dot, on && styles.dotOn]} />
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.title}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={selectedGoals.length === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  pbar: { marginTop: 6 },
  head: { marginTop: 24 },
  h1: { fontSize: 32, fontWeight: "800", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: OBV2_COLOR.card,
    borderWidth: 1.5,
    borderColor: OBV2_COLOR.hair,
    borderRadius: OBV2_RADIUS.chip,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipOn: { backgroundColor: OBV2_COLOR.peach, borderColor: OBV2_COLOR.peach },
  chipText: { fontSize: 15, fontWeight: "600", color: OBV2_COLOR.ink },
  chipTextOn: { color: OBV2_COLOR.orangeInk },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: OBV2_COLOR.hair },
  dotOn: { backgroundColor: OBV2_COLOR.orange },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26 },
});
