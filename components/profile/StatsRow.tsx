import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  streak: number;
  best: number;
  active: number;
  done: number;
};

export default function StatsRow({ streak, best, active, done }: Props) {
  const items = [
    { label: "streak", value: streak },
    { label: "best", value: best },
    { label: "active", value: active },
    { label: "done", value: done },
  ];
  return (
    <View style={s.row}>
      {items.map((item) => (
        <View key={item.label} style={s.card}>
          <Text style={s.value}>{item.value}</Text>
          <Text style={s.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 24, marginTop: 20 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center" },
  value: { fontSize: 22, fontWeight: "700", color: "#1A1A1A" },
  label: { marginTop: 3, fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
});
