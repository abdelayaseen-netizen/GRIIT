import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, radius, spacing } from "@/lib/theme/tokens";

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
    backgroundColor: colors.cardBg,
    borderRadius: radius.cardCreate,
    padding: spacing.screenHorizontal,
    marginBottom: spacing.gridM,
  },
  title: {
    fontSize: typography.sectionTitle.fontSize,
    fontWeight: typography.sectionTitle.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.gridM,
  },
});
