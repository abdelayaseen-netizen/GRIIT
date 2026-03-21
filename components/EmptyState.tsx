import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${subtitle ?? ""}`}
    >
      <View style={styles.iconWrap}>
        <Icon size={40} color={DS_COLORS.TEXT_TERTIARY} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? (
        <View style={styles.actionWrap}>
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={8}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_SPACING.XXL,
    paddingHorizontal: DS_SPACING.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.md,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: DS_SPACING.xs,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: DS_TYPOGRAPHY.SIZE_SM * 1.5,
    maxWidth: 280,
  },
  actionWrap: {
    marginTop: DS_SPACING.lg,
  },
  actionText: {
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.ACCENT,
  },
});
