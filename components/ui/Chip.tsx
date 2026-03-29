import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors } from "@/lib/theme/colors";
import { radius } from "@/lib/theme/radius";
import { spacing } from "@/lib/theme/spacing";
import { typography } from "@/lib/theme/typography";

type ChipVariant = "accentSoft" | "muted";

const variantStyles: Record<ChipVariant, { bg: string; text: string }> = {
  accentSoft: { bg: colors.accentSoft, text: colors.text },
  muted: { bg: colors.surfaceMuted, text: colors.textMuted },
};

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  variant = "muted",
  onPress,
  selected = false,
  style,
}: ChipProps) {
  const v = variantStyles[variant];
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.chip,
        { backgroundColor: v.bg },
        selected && styles.selected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      {...(onPress
        ? {
            accessibilityLabel: label,
            accessibilityRole: "button" as const,
            accessibilityState: { selected },
          }
        : {})}
    >
      <Text style={[styles.text, { color: v.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.body2,
    fontWeight: "600",
  },
  selected: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
