/**
 * StreakPill — ember icon + "{n} day streak" (singular day, no hyphen).
 * Count is passed in by the parent; SecuredScreen supplies the real
 * `stats.activeStreak` from useApp.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { formatStreakPillLabel } from "@/lib/streak-pill";

export type StreakPillProps = {
  streakCount: number;
};

export function StreakPill({ streakCount }: StreakPillProps) {
  const label = formatStreakPillLabel(streakCount);
  return (
    <View style={styles.pill} accessibilityLabel={label}>
      <Flame size={14} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: DS_SPACING_V2.xs,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
});
