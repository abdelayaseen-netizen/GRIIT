import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@/src/theme/tokens";

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  caption?: string;
}

export function SectionHeader({ title, icon, caption }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      {icon != null && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {caption != null && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.md,
  },
  iconWrap: {
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sectionHeader.fontSize,
    fontWeight: typography.sectionHeader.fontWeight,
    lineHeight: typography.sectionHeader.lineHeight,
    color: colors.textPrimary,
    flex: 1,
  },
  caption: {
    fontSize: typography.metaRow.fontSize,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: "auto",
  },
});
