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
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.filterPillInactiveBorder,
  },
  chipActive: {
    backgroundColor: DS_COLORS.black,
    borderColor: DS_COLORS.black,
  },
  text: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: DS_COLORS.filterChipActiveBg,
  },
  textActive: {
    color: DS_COLORS.white,
  },
});
