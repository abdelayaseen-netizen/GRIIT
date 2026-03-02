import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as t from "@/src/theme/tokens";

export function CategoryTag({
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
    >
      <Text style={[s.text, selected && s.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  tag: {
    paddingVertical: t.spacing.gridXS,
    paddingHorizontal: 14,
    borderRadius: t.radius.tagCreate,
    backgroundColor: t.colors.cardBg,
    borderWidth: 1.5,
    borderColor: t.colors.borderLight,
  },
  tagSelected: {
    backgroundColor: t.colors.accentOrangeSoft,
    borderColor: t.colors.accentOrangeCreate,
  },
  text: {
    fontSize: t.typography.primaryBody.fontSize,
    fontWeight: "500",
    color: t.colors.textPrimary,
  },
  textSelected: { color: t.colors.accentOrangeCreate },
});
