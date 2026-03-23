import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

export default function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={s.wrap} accessibilityLabel={`${label} ${value}`}>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: DS_RADIUS.pill,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.xs,
  },
  value: { color: DS_COLORS.TEXT_PRIMARY, fontWeight: "700", fontSize: DS_TYPOGRAPHY.SIZE_SM },
  label: { color: DS_COLORS.TEXT_MUTED, fontSize: DS_TYPOGRAPHY.SIZE_XS },
});

