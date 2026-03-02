import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as tokens from "@/src/theme/tokens";

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
    <TouchableOpacity style={[s.chip, selected && s.chipActive]} onPress={onPress} activeOpacity={0.8}>
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
    paddingHorizontal: tokens.measures.chipPaddingH,
    paddingVertical: tokens.measures.chipPaddingV,
    borderRadius: tokens.radius.chip,
    backgroundColor: tokens.colors.surface,
    borderWidth: tokens.borders.chip.borderWidth,
    borderColor: tokens.borders.chip.borderColor,
  },
  chipActive: {
    backgroundColor: tokens.colors.black,
    borderColor: tokens.colors.black,
  },
  text: {
    fontSize: tokens.typography.chipLabel.fontSize,
    fontWeight: tokens.typography.chipLabel.fontWeight,
    color: tokens.colors.chipText,
  },
  textActive: {
    color: tokens.colors.white,
  },
});
