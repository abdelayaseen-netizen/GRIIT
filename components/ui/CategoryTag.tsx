import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

function CategoryTagInner({
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
      style={[s.tag, selected && s.tagSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Select ${label} category`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[s.text, selected && s.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const CategoryTag = React.memo(CategoryTagInner);

const s = StyleSheet.create({
  tag: {
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
  },
  tagSelected: {
    backgroundColor: DS_COLORS.accentSoft,
    borderColor: DS_COLORS.accent,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
  },
  textSelected: { color: DS_COLORS.accent },
});
