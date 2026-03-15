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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  chipActive: {
    backgroundColor: DS_COLORS.textPrimary,
    borderColor: DS_COLORS.textPrimary,
  },
  text: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  textActive: {
    color: DS_COLORS.white,
  },
});
