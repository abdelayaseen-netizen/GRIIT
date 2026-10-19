import React, { useCallback } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Activity,
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  HeartPulse,
  ListChecks,
  Sunrise,
  type LucideIcon,
} from "lucide-react-native";
import { useOnboardingStore, type OnboardingGoal } from "@/store/onboardingStore";
import { FIRST_DAY_GOALS, GOALS_COPY, MAX_FIRST_DAY_GOALS, goalHint, pickGoal } from "@/lib/first-day";
import { GOAL_LABELS } from "@/lib/goal-challenge-map";
import { track } from "@/lib/analytics";
import { DS_V3 } from "@/lib/design-system";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";

/** Build 92 09.1 (P3-01 – P3-03): 7 goals in 2 columns of 56 pt cards, all above the docked button on SE. */
export const MAX_GOALS = MAX_FIRST_DAY_GOALS;

const ICONS: Partial<Record<OnboardingGoal, LucideIcon>> = {
  physical_toughness: Dumbbell,
  faith_prayer: Sunrise,
  running: Activity,
  reading_learning: BookOpen,
  health: HeartPulse,
  daily_habits: ListChecks,
  mental_discipline: Brain,
};

const ICON = 20;
const TICK = 22;

function GoalCard({ id, label, on, onPress }: { id: OnboardingGoal; label: string; on: boolean; onPress: () => void }) {
  const Icon = ICONS[id] ?? Check;
  const ink = on ? DS_V3.color.canvas : DS_V3.color.textPrimary;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, on ? styles.cardOn : styles.cardOff, pressed && styles.pressed]}
    >
      <Icon size={ICON} color={ink} />
      <Text style={[styles.label, { color: ink }]} numberOfLines={2}>
        {label}
      </Text>
      {on ? (
        <View style={styles.tick}>
          <Check size={13} color={DS_V3.color.textPrimary} strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

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
      const { next, swappedOut } = pickGoal(selectedGoals, id);
      setSelectedGoals(next);
      if (swappedOut) {
        AccessibilityInfo.announceForAccessibility(`${GOAL_LABELS[swappedOut]} removed`);
      }
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
      title={GOALS_COPY.title}
      subtitle={GOALS_COPY.subtitle}
      footer={
        <>
          <Text style={styles.hint} accessibilityLiveRegion="polite">
            {goalHint(selectedGoals.length)}
          </Text>
          <ChromePrimary label={GOALS_COPY.cta} disabled={blocked} onPress={handleContinue} />
        </>
      }
    >
      <View style={styles.grid}>
        {FIRST_DAY_GOALS.map((g) => (
          <GoalCard
            key={g.id}
            id={g.id}
            label={g.label}
            on={selectedGoals.includes(g.id)}
            onPress={() => toggle(g.id)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: DS_V3.space.sm,
  },
  card: {
    width: "48%",
    minHeight: 56,
    paddingHorizontal: DS_V3.space.md,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardOff: { backgroundColor: DS_V3.color.surface },
  cardOn: { backgroundColor: DS_V3.color.textPrimary },
  label: {
    flex: 1,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "500",
  },
  tick: {
    width: TICK,
    height: TICK,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  pressed: { opacity: 0.8 },
});
