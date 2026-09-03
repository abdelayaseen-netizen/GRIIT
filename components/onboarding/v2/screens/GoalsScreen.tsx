import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useOnboardingStore, type OnboardingGoal } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton } from "../ui";

const V2_GOAL_TILES: { id: OnboardingGoal; label: string; example: string }[] = [
  { id: "physical_toughness", label: "Physical toughness", example: "Lifting, running, no missed sessions" },
  { id: "mental_discipline", label: "Mental discipline", example: "Meditation, journaling, focus blocks" },
  { id: "daily_habits", label: "Daily habits", example: "Wake times, water, tidy space" },
  { id: "reading_learning", label: "Reading & learning", example: "Pages a day, a course, a language" },
  { id: "cold_exposure", label: "Cold exposure", example: "Cold showers, plunges, breathwork" },
  { id: "sleep_recovery", label: "Sleep & recovery", example: "Phone down, lights out, rest days" },
];

export default function GoalsScreen({ onContinue }: { onContinue: () => void }) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);

  const toggle = useCallback(
    (id: OnboardingGoal) => {
      if (selectedGoals.includes(id)) {
        setSelectedGoals(selectedGoals.filter((g) => g !== id));
        return;
      }
      setSelectedGoals([...selectedGoals, id]);
    },
    [selectedGoals, setSelectedGoals]
  );

  const handleContinue = useCallback(() => {
    if (selectedGoals.length === 0) return;
    track({ name: "onboarding_goals_selected", goals: selectedGoals });
    onContinue();
  }, [selectedGoals, onContinue]);

  const blocked = selectedGoals.length === 0;

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>What are you{"\n"}building?</Text>
        <Text style={styles.sub}>Pick two or three. It changes which challenges we put in front of you.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.grid}>
          {V2_GOAL_TILES.map((g) => {
            const on = selectedGoals.includes(g.id);
            return (
              <Pressable
                key={g.id}
                onPress={() => toggle(g.id)}
                style={[styles.tile, on && styles.tileOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${g.label}. ${g.example}`}
              >
                <View style={[styles.indicator, on && styles.indicatorOn]}>
                  <View style={[styles.dot, on && styles.dotOn]} />
                </View>
                <View>
                  <Text style={[styles.label, on && styles.labelOn]}>{g.label}</Text>
                  <Text style={[styles.example, on && styles.exampleOn]}>{g.example}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={blocked ? "Pick at least one" : "Continue"}
          onPress={handleContinue}
          disabled={blocked}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flex: 1, justifyContent: "center", paddingVertical: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "48%",
    flexGrow: 1,
    minHeight: 112,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: OBV2_COLOR.hair,
    backgroundColor: OBV2_COLOR.card,
    justifyContent: "space-between",
  },
  tileOn: { backgroundColor: OBV2_COLOR.orange, borderColor: OBV2_COLOR.orange },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: OBV2_COLOR.sunken,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorOn: { backgroundColor: "rgba(255,255,255,0.22)" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: OBV2_COLOR.mutedWarm },
  dotOn: { backgroundColor: OBV2_COLOR.onDark },
  label: { fontSize: 15, fontWeight: "500", lineHeight: 17, color: OBV2_COLOR.ink },
  labelOn: { color: OBV2_COLOR.onDark },
  example: { fontSize: 12, fontWeight: "500", lineHeight: 15, color: OBV2_COLOR.mutedWarm, marginTop: 4 },
  exampleOn: { color: "rgba(255,255,255,0.75)" },
  footer: { paddingTop: 14, paddingBottom: 32 },
});
