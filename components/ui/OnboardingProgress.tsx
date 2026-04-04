import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING } from "@/lib/design-system"

type OnboardingProgressProps = { step: number; total: number };

export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {step} <Text style={styles.sep}>/</Text> {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    alignSelf: "flex-end",
  },
  text: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  sep: { fontWeight: "400", color: DS_COLORS.textMuted },
});
