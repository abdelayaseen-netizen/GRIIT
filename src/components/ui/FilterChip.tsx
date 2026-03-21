import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

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
      accessibilityLabel={`Filter by ${label}`}
      accessibilityRole="button"
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
    borderRadius: 20,
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
    fontWeight: "600" as const,
  },
});
