import { DS_V3, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

function DurationPillInner({
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
      accessibilityLabel={`${label} — ${selected ? "selected" : "tap to select"}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[s.text, selected && s.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const DurationPill = React.memo(DurationPillInner);

const s = StyleSheet.create({
  pill: {
    paddingVertical: 10,
    paddingHorizontal: DS_SPACING.lg,
    borderRadius: DS_RADIUS.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1.5,
    borderColor: DS_V3.color.border,
  },
  pillSelected: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: 2,
    borderColor: DS_V3.color.brand,
  },
  text: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_V3.color.textPrimary,
  },
  textSelected: { color: DS_V3.color.brand },
});
