import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useOnboardingStore, type OnboardingGoal } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";
import { DS_V3 } from "@/lib/design-system";
import { ChromePrimary, OnboardingScreen, OptionRow } from "../OnboardingChrome";

export const V2_GOAL_TILES: { id: OnboardingGoal; label: string; example: string }[] = [
  { id: "physical_toughness", label: "Physical toughness", example: "Lifting, running, no missed sessions" },
  { id: "mental_discipline", label: "Mental discipline", example: "Meditation, journaling, focus blocks" },
  { id: "daily_habits", label: "Daily habits", example: "Wake times, water, tidy space" },
  { id: "reading_learning", label: "Reading and learning", example: "Pages a day, a course, a language" },
  { id: "cold_exposure", label: "Cold exposure", example: "Cold showers, plunges, breathwork" },
  { id: "sleep_recovery", label: "Sleep and recovery", example: "Phone down, lights out, rest days" },
  { id: "faith_prayer", label: "Faith and prayer", example: "Daily prayers, Quran, dhikr" },
];

export const MAX_GOALS = 3;
const GRID = V2_GOAL_TILES.slice(0, 6);
const FAITH = V2_GOAL_TILES[6]!;

export default function GoalsScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);

  const toggle = useCallback(
    (id: OnboardingGoal) => {
      if (selectedGoals.includes(id)) {
        setSelectedGoals(selectedGoals.filter((g) => g !== id));
        return;
      }
      if (selectedGoals.length >= MAX_GOALS) return;
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
    <OnboardingScreen
      step={0}
      onBack={onBack}
      title="What are you building?"
      subtitle={`Pick 1 to ${MAX_GOALS}. It filters the challenges we suggest.`}
      footer={
        <ChromePrimary
          label={blocked ? "Pick at least one" : "Continue"}
          disabled={blocked}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.body}>
        <View style={styles.grid}>
          {GRID.map((g) => {
            const on = selectedGoals.includes(g.id);
            const atCap = !on && selectedGoals.length >= MAX_GOALS;
            return (
              <View key={g.id} style={styles.cell}>
                <OptionRow
                  title={g.label}
                  subtitle={g.example}
                  selected={on}
                  dimmed={atCap}
                  onPress={() => toggle(g.id)}
                />
              </View>
            );
          })}
        </View>
        <OptionRow
          title={FAITH.label}
          subtitle={FAITH.example}
          selected={selectedGoals.includes(FAITH.id)}
          dimmed={!selectedGoals.includes(FAITH.id) && selectedGoals.length >= MAX_GOALS}
          onPress={() => toggle(FAITH.id)}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
  },
  cell: {
    width: "48%",
    flexGrow: 1,
  },
});
