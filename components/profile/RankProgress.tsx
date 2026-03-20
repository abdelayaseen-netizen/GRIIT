import React from "react";
import { View, Text, StyleSheet } from "react-native";

const RANK_TIERS = [
  { name: "Starter", minPoints: 0, color: "#E8593C" },
  { name: "Builder", minPoints: 50, color: "#FF9800" },
  { name: "Disciplined", minPoints: 150, color: "#5B7FD4" },
  { name: "Elite", minPoints: 400, color: "#9C27B0" },
  { name: "Legend", minPoints: 1000, color: "#FFD700" },
] as const;

function getCurrentRank(points: number) {
  return [...RANK_TIERS].reverse().find((t) => points >= t.minPoints) ?? RANK_TIERS[0];
}
function getNextRank(points: number) {
  return RANK_TIERS.find((t) => t.minPoints > points) ?? RANK_TIERS[RANK_TIERS.length - 1] ?? RANK_TIERS[0];
}

export default function RankProgress({ points }: { points: number }) {
  const current = getCurrentRank(points);
  const next = getNextRank(points);
  if (!current || !next) return null;
  const tierSpan = Math.max(1, next.minPoints - current.minPoints);
  const inTier = Math.max(0, points - current.minPoints);
  const pct = Math.max(2, Math.min(100, Math.round((inTier / tierSpan) * 100)));
  const ptsToNext = Math.max(0, next.minPoints - points);
  return (
    <View style={s.card}>
      <View style={s.headRow}>
        <Text style={s.head}>Rank progress</Text>
        <Text style={s.right}>{`${ptsToNext} pts to ${next.name}`}</Text>
      </View>
      <View style={s.labels}>
        <Text style={s.leftLabel}>{current.name}</Text>
        <Text style={s.rightLabel}>{next.name}</Text>
      </View>
      <View style={s.track}><View style={[s.fill, { width: `${pct}%` }]} /></View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 24, marginTop: 20, backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  head: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  right: { fontSize: 11, color: "#999" },
  labels: { marginTop: 10, marginBottom: 8, flexDirection: "row", justifyContent: "space-between" },
  leftLabel: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  rightLabel: { fontSize: 12, fontWeight: "600", color: "#BBB" },
  track: { height: 6, backgroundColor: "#F0EDE6", borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, backgroundColor: "#E8593C", borderRadius: 3 },
});
