import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

const RANK_TIERS = [
  { name: "Starter", minPoints: 0, color: DS_COLORS.DISCOVER_CORAL },
  { name: "Builder", minPoints: 50, color: DS_COLORS.WARNING },
  { name: "Disciplined", minPoints: 150, color: DS_COLORS.DISCOVER_BLUE },
  { name: "Elite", minPoints: 400, color: DS_COLORS.CATEGORY_MIND },
  { name: "Legend", minPoints: 1000, color: DS_COLORS.milestoneGold },
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
    <View
      style={s.card}
      accessibilityRole="none"
      accessibilityLabel={`Rank progress — ${current.name} — ${ptsToNext} points to reach ${next.name}`}
    >
      <View style={s.headRow}>
        <Text style={s.head}>Rank progress</Text>
        <Text style={s.right}>{`${ptsToNext} pts to ${next.name}`}</Text>
      </View>
      <View style={s.labels}>
        <Text style={s.leftLabel}>{current.name}</Text>
        <Text style={s.rightLabel}>{next.name}</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%`, backgroundColor: current.color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.lg,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
  },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  head: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  right: { fontSize: 11, color: DS_COLORS.TEXT_MUTED },
  labels: { marginTop: 10, marginBottom: DS_SPACING.sm, flexDirection: "row", justifyContent: "space-between" },
  leftLabel: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  rightLabel: { fontSize: 12, fontWeight: "600", color: DS_COLORS.grayMuted },
  track: {
    height: 6,
    backgroundColor: DS_COLORS.CARD_ALT_BG,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: 6, borderRadius: 3 },
});
