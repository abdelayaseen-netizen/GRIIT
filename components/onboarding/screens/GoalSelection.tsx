import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S, GOAL_OPTIONS } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboarding-store';
import { track } from '@/lib/analytics';

interface GoalSelectionProps {
  onContinue: () => void;
}

export default function GoalSelection({ onContinue }: GoalSelectionProps) {
  const { selectedGoals, toggleGoal } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
        <Text style={styles.title}>What do you want{'\n'}to build?</Text>
        <Text style={styles.subtitle}>Pick up to 3. We&apos;ll find the right challenges for you.</Text>
      </View>

      <View style={styles.grid}>
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <Pressable
              key={goal.id}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Text style={styles.goalEmoji}>{goal.emoji}</Text>
              <View style={styles.goalTextContainer}>
                <Text style={[styles.goalTitle, isSelected && styles.goalTitleSelected]}>
                  {goal.title}
                </Text>
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkMark}>
                  <Text style={styles.checkMarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <Pressable
          style={[styles.primaryButton, selectedGoals.length === 0 && styles.primaryButtonDisabled]}
          onPress={() => { track({ name: 'onboarding_goals_selected', goals: selectedGoals }); onContinue(); }}
          disabled={selectedGoals.length === 0}
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
  header: { marginBottom: 28 },
  stepLabel: { fontSize: T.captionSize, color: C.accent, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, lineHeight: T.headingLineHeight, letterSpacing: T.headingLetterSpacing, marginBottom: 8 },
  subtitle: { fontSize: T.smallSize, color: C.textSecondary, lineHeight: T.smallLineHeight },
  grid: { flex: 1, gap: S.cardGap },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: S.cardRadius, padding: 16, borderWidth: 1, borderColor: C.border, gap: 14 },
  goalCardSelected: { borderWidth: 2, borderColor: C.borderActive, backgroundColor: C.surface },
  goalEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  goalTextContainer: { flex: 1 },
  goalTitle: { fontSize: T.bodySize, fontWeight: '600', color: C.textPrimary, marginBottom: 2 },
  goalTitleSelected: { color: C.textPrimary },
  goalSubtitle: { fontSize: T.captionSize, color: C.textTertiary },
  checkMark: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.borderActive, justifyContent: 'center', alignItems: 'center' },
  checkMarkText: { color: C.WHITE, fontSize: 14, fontWeight: '700' },
  ctaContainer: { paddingTop: 16 },
  primaryButton: { backgroundColor: C.commitmentButtonBg, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonDisabled: { backgroundColor: C.DISABLED_BG },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  primaryButtonTextDisabled: { color: C.WHITE },
});
