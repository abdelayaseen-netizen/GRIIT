import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

export function FilterChip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[s.chip, selected && s.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${label === "All" ? "All categories" : `${label} category`} — ${selected ? "selected" : "not selected"}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon != null && <>{icon}</>}
      <Text style={[s.text, selected && s.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
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
