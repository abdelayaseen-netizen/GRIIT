import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0DDD6",
  },
  chipActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  text: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#444",
  },
  textActive: {
    color: "#FFFFFF",
  },
});
