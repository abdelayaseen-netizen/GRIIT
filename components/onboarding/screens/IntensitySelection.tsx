import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S, INTENSITY_OPTIONS } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboarding-store';

interface IntensitySelectionProps {
  onContinue: () => void;
}

export default function IntensitySelection({ onContinue }: IntensitySelectionProps) {
  const { intensityLevel, setIntensity } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
        <Text style={styles.title}>How hard do{'\n'}you go?</Text>
        <Text style={styles.subtitle}>Be honest. We&apos;ll match you with the right level.</Text>
      </View>

      <View style={styles.options}>
        {INTENSITY_OPTIONS.map((option) => {
          const isSelected = intensityLevel === option.id;
          return (
            <Pressable
              key={option.id}
              style={[styles.intensityCard, isSelected && styles.intensityCardSelected]}
              onPress={() => setIntensity(option.id)}
            >
              <View style={styles.intensityHeader}>
                <Text style={styles.intensityEmoji}>{option.emoji}</Text>
                <View style={styles.intensityTitleContainer}>
                  <Text style={[styles.intensityTitle, isSelected && styles.intensityTitleSelected]}>
                    {option.title}
                  </Text>
                  <Text style={styles.intensitySubtitle}>{option.subtitle}</Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>
              <Text style={styles.intensityDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <Pressable
          style={[styles.primaryButton, !intensityLevel && styles.primaryButtonDisabled]}
          onPress={onContinue}
          disabled={!intensityLevel}
        >
          <Text style={[styles.primaryButtonText, !intensityLevel && styles.primaryButtonTextDisabled]}>
            Show me challenges
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
  options: { flex: 1, gap: S.cardGap, justifyContent: 'center' },
  intensityCard: { backgroundColor: C.surface, borderRadius: S.cardRadius, padding: 18, borderWidth: 1, borderColor: C.border, gap: 10 },
  intensityCardSelected: { borderColor: C.accent, backgroundColor: C.accentMuted },
  intensityHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  intensityEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  intensityTitleContainer: { flex: 1 },
  intensityTitle: { fontSize: T.bodySize, fontWeight: '700', color: C.textPrimary },
  intensityTitleSelected: { color: C.accentLight },
  intensitySubtitle: { fontSize: T.captionSize, color: C.textTertiary, marginTop: 2 },
  intensityDescription: { fontSize: T.captionSize, color: C.textSecondary, paddingLeft: 48, lineHeight: 18 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.textTertiary, justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: C.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.accent },
  ctaContainer: { paddingTop: 16 },
  primaryButton: { backgroundColor: C.accent, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonDisabled: { backgroundColor: C.surfaceElevated },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  primaryButtonTextDisabled: { color: C.textTertiary },
});
