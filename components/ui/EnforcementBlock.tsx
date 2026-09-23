import { DS_V3, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

/** Inlined from lib/theme/tokens.ts `typography.sectionTitle` — value-preserving migration (Phase 2). */
const THEME_TYPO_SECTION_TITLE = {
  fontSize: 20,
  fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  lineHeight: 28,
};

type Props = { title?: string; children: React.ReactNode };

export function EnforcementBlock({ title = "Time enforcement", children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.lg,
  },
  title: {
    fontSize: THEME_TYPO_SECTION_TITLE.fontSize,
    fontWeight: THEME_TYPO_SECTION_TITLE.fontWeight,
    lineHeight: THEME_TYPO_SECTION_TITLE.lineHeight,
    color: DS_V3.color.textPrimary,
    marginBottom: DS_SPACING.lg,
  },
});
