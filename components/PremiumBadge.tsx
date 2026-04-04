import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

interface PremiumBadgeProps {
  /** Icon size when not using label. */
  size?: number;
  /** Show "PRO" pill (orange bg, white text) instead of icon-only. */
  label?: "PRO" | "PREMIUM";
}

/**
 * Small premium badge: Crown icon and/or "PRO"/"PREMIUM" pill for premium-only features.
 */
export function PremiumBadge({ size = 14, label }: PremiumBadgeProps) {
  const { colors } = useTheme();
  const accent = colors.accent ?? DS_COLORS.accent;

  if (label) {
    return (
      <View style={[styles.pill, { backgroundColor: accent }]}>
        <Text style={styles.pillText}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: accent + "20" }]}>
      <Crown size={size} color={accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: DS_RADIUS.SM,
    alignSelf: "flex-start",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS.SM,
    alignSelf: "flex-start",
  },
  pillText: {
    color: DS_COLORS.WHITE,
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 0.5,
  },
});
