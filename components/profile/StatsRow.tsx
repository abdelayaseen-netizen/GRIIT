import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

type Props = {
  streak: number;
  best: number;
  active: number;
  done: number;
};

export default React.memo(function StatsRow({ streak, best, active, done }: Props) {
  const dayOneMode = streak === 0 && best === 0;
  const items = [
    { label: "streak", value: dayOneMode ? "Day 1" : streak },
    { label: "best", value: dayOneMode ? "Day 1" : best },
    { label: "active", value: active },
    { label: "done", value: done === 0 ? "–" : done },
  ];
  return (
    <View style={s.row}>
      {items.map((item) => (
        <View
          key={item.label}
          style={s.card}
          accessibilityRole="none"
          accessibilityLabel={`${item.value} ${item.label}`}
        >
          <Text style={s.value}>{item.value}</Text>
          <Text style={s.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 24, marginTop: 20 },
  card: { flex: 1, backgroundColor: DS_COLORS.WHITE, borderRadius: 14, padding: 14, alignItems: "center" },
  value: { fontSize: 22, fontWeight: "700", color: DS_COLORS.DISCOVER_INK },
  label: { marginTop: 3, fontSize: 10, color: DS_COLORS.TEXT_MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
});
