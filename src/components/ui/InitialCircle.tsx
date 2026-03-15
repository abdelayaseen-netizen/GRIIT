import React from "react";
import { View, Text, StyleSheet } from "react-native";

const INITIAL_CIRCLE_COLORS = ["#E8845F", "#2D8A4E", "#7B61FF", "#00897B", "#C4960C", "#D94040"] as const;

function getInitialColor(username: string): string {
  const code = (username || "?").charCodeAt(0) ?? 0;
  return INITIAL_CIRCLE_COLORS[code % INITIAL_CIRCLE_COLORS.length];
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
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
