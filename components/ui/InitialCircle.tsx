import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_V3, DS_TYPOGRAPHY } from "@/lib/design-system"

const INITIAL_CIRCLE_COLORS = [
  DS_V3.color.brandTint,
  DS_V3.color.brandTint,
  DS_V3.color.brandTint,
  DS_V3.color.brandTint,
  DS_V3.color.brandTint,
  DS_V3.color.brandTint,
] as const;

function getInitialColor(username: string): string {
  const code = (username || "?").charCodeAt(0) ?? 0;
  const idx = code % INITIAL_CIRCLE_COLORS.length;
  return INITIAL_CIRCLE_COLORS[idx] ?? DS_V3.color.brandTint;
}

export function InitialCircle({ username, size = 44 }: { username: string; size?: number }) {
  const name = username || "?";
  const bg = getInitialColor(name);
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[s.text, { fontSize: size <= 44 ? 18 : 20 }]}>{initial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: DS_V3.color.textPrimary,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
});
