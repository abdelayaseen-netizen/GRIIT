import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  securedDateKeys: string[];
};

function monthLabels() {
  const now = new Date();
  const out: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toLocaleString("en-US", { month: "short" }));
  }
  return out;
}

export default function ActivityHeatmap({ securedDateKeys }: Props) {
  const securedSet = useMemo(() => new Set(securedDateKeys), [securedDateKeys]);
  const cells = useMemo(() => {
    const arr: number[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push(securedSet.has(key) ? 1 : 0);
    }
    return arr;
  }, [securedSet]);
  const mostlyEmpty = cells.filter((c) => c > 0).length < 5;

  return (
    <View style={s.wrap}>
      <Text style={s.header}>Activity</Text>
      <View style={s.card}>
        <View style={s.months}>
          {monthLabels().map((m) => <Text key={m} style={s.month}>{m}</Text>)}
        </View>
        <View style={s.grid}>
          {cells.map((v, idx) => (
            <View key={idx} style={[s.cell, { backgroundColor: v === 0 ? "#E8E4DC" : "#C8E6C9" }]} />
          ))}
        </View>
        {mostlyEmpty ? <Text style={s.helper}>Complete goals to light up your grid</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: { fontSize: 13, fontWeight: "700", color: "#1A1A1A", paddingHorizontal: 24, marginBottom: 10 },
  card: { marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  months: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  month: { fontSize: 11, color: "#999" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: 8, height: 8, borderRadius: 2, margin: 1 },
  helper: { marginTop: 8, fontSize: 10, color: "#BBB", textAlign: "center" },
});
