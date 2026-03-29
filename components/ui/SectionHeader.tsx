import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/theme/tokens";
import { DS_COLORS } from "@/lib/design-system";

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
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  iconWrap: {
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  caption: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: "auto",
  },
});
