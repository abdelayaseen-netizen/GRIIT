import React from "react";
import { View, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface PremiumBadgeProps {
  size?: number;
}

/**
 * Small premium badge/icon to place next to premium-only features.
 */
export function PremiumBadge({ size = 14 }: PremiumBadgeProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.accent + "20" }]}>
      <Crown size={size} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
});
