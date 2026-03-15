import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as t from "@/src/theme/tokens";

export function DurationPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.pill, selected && s.pillSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Set duration to ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[s.text, selected && s.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  pill: {
    paddingVertical: 10,
    paddingHorizontal: t.spacing.gridM,
    borderRadius: t.radius.pillCreate,
    backgroundColor: t.colors.cardBg,
    borderWidth: 1.5,
    borderColor: t.colors.borderLight,
  },
  pillSelected: {
    backgroundColor: t.colors.cardBg,
    borderWidth: 2,
    borderColor: t.colors.accentOrangeCreate,
  },
  text: {
    fontSize: t.typography.primaryBody.fontSize,
    fontWeight: "600",
    color: t.colors.textPrimary,
  },
  textSelected: { color: t.colors.accentOrangeCreate },
});
