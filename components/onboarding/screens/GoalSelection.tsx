import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S, GOAL_OPTIONS } from "@/components/onboarding/onboarding-theme";
import { DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"
import { useOnboardingStore } from "@/store/onboardingStore";
import { track } from "@/lib/analytics";

interface GoalSelectionProps {
  onContinue: () => void;
}

export default function GoalSelection({ onContinue }: GoalSelectionProps) {
  const { selectedGoals, toggleGoal } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
        <Text style={styles.title}>What do you want{"\n"}to build?</Text>
        <Text style={styles.subtitle}>Pick up to 3. We&apos;ll find the right challenges for you.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <Pressable
              key={goal.id}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleGoal(goal.id);
              }}
              accessibilityLabel={`${goal.title} — ${goal.subtitle} — ${isSelected ? "selected" : "tap to select"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={styles.goalEmoji}>{goal.emoji}</Text>
              <View style={styles.goalTextContainer}>
                <Text style={[styles.goalTitle, isSelected && styles.goalTitleSelected]}>{goal.title}</Text>
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
              </View>
              {isSelected ? (
                <View style={styles.checkMark}>
                  <Text style={styles.checkMarkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.ctaContainer}>
        <Pressable
          style={[styles.primaryButton, selectedGoals.length === 0 && styles.primaryButtonDisabled]}
          onPress={() => {
            track({ name: "onboarding_goals_selected", goals: selectedGoals });
            onContinue();
          }}
          disabled={selectedGoals.length === 0}
          accessibilityLabel="Continue with selected goals"
          accessibilityRole="button"
          accessibilityState={{ disabled: selectedGoals.length === 0 }}
        >
          <Text style={[styles.primaryButtonText, selectedGoals.length === 0 && styles.primaryButtonTextDisabled]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  stepLabel: { fontSize: 11, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, letterSpacing: 1, lineHeight: 16, color: C.accent, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, letterSpacing: -0.5, lineHeight: 34, color: C.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: T.bodySize, fontWeight: "400", lineHeight: 24, color: C.textSecondary },
  scroll: { flex: 1 },
  grid: { gap: S.cardGap, paddingBottom: 12 },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: DS_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
  },
  goalCardSelected: { borderWidth: 2, borderColor: C.borderActive, backgroundColor: C.surface },
  goalEmoji: { fontSize: 28, width: 40, textAlign: "center" },
  goalTextContainer: { flex: 1 },
  goalTitle: { fontSize: T.bodySize, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: C.textPrimary, marginBottom: 2 },
  goalTitleSelected: { color: C.textPrimary },
  goalSubtitle: { fontSize: T.captionSize, color: C.textTertiary },
  checkMark: {
    width: 20,
    height: 20,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: C.borderActive,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMarkText: { color: C.WHITE, fontSize: 12, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  ctaContainer: { paddingTop: 16 },
  primaryButton: {
    backgroundColor: C.darkCta,
    height: S.buttonHeight,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonDisabled: { backgroundColor: C.DISABLED_BG },
  primaryButtonText: { fontSize: 17, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, lineHeight: 22, color: C.textOnAccent },
  primaryButtonTextDisabled: { color: C.WHITE },
});
