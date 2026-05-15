import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS, DS_SPACING } from "@/lib/design-system";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native";

/** Inlined from lib/theme/typography.ts `typography.body2` — value-preserving migration (Phase 2). */
const THEME_TYPO_BODY2 = {
  fontSize: 14,
  fontWeight: "500" as const,
  lineHeight: 20,
};

type ChipVariant = "accentSoft" | "muted" | "filter";

const variantStyles: Record<Exclude<ChipVariant, "filter">, { bg: string; text: string }> = {
  accentSoft: { bg: DS_COLORS.accentSoft, text: DS_COLORS.textPrimary },
  muted: { bg: DS_COLORS.surfaceMuted, text: DS_COLORS.textMuted },
};

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
};

export function Chip({
  label,
  variant = "muted",
  onPress,
  selected = false,
  style,
  icon,
  accessibilityLabel: accessibilityLabelProp,
}: ChipProps) {
  if (variant === "filter") {
    const a11y =
      accessibilityLabelProp ??
      `${label === "All" ? "All categories" : `${label} category`} — ${selected ? "selected" : "not selected"}`;
    return (
      <TouchableOpacity
        style={[filterStyles.chip, selected && filterStyles.chipActive, style]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.8}
        accessibilityLabel={a11y}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {icon != null ? <>{icon}</> : null}
        <Text style={[filterStyles.text, selected && filterStyles.textActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

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
            accessibilityLabel: accessibilityLabelProp ?? label,
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
    paddingHorizontal: 14,
    paddingVertical: DS_SPACING.sm,
    borderRadius: 999,
  },
  text: {
    ...THEME_TYPO_BODY2,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  selected: {
    borderWidth: 1,
    borderColor: DS_COLORS.textPrimary,
  },
});

const filterStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
  },
  chipActive: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderColor: DS_COLORS.TEXT_PRIMARY,
  },
  text: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: DS_COLORS.FILTER_LABEL_MUTED,
  },
  textActive: {
    color: DS_COLORS.WHITE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
});
