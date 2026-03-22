import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { X, Flame, Zap, Target, Star, Shield } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS } from "@/lib/design-system";

const POINT_RULES = [
  { action: "Secure a day", points: "+5", icon: Flame, color: DS_COLORS.DISCOVER_CORAL },
  { action: "Complete a task", points: "+1", icon: Target, color: DS_COLORS.DISCOVER_GREEN },
  { action: "Active challenge bonus", points: "+7/day", icon: Zap, color: DS_COLORS.DISCOVER_BLUE },
  { action: "Miss a day (loss aversion)", points: "-3", icon: Shield, color: DS_COLORS.danger },
  { action: "Hard mode completion", points: "+3 bonus", icon: Star, color: DS_COLORS.WARNING },
];

const RANKS = [
  { name: "Starter", min: 0, color: DS_COLORS.DISCOVER_CORAL },
  { name: "Builder", min: 50, color: DS_COLORS.WARNING },
  { name: "Disciplined", min: 150, color: DS_COLORS.DISCOVER_BLUE },
  { name: "Elite", min: 400, color: DS_COLORS.CATEGORY_MIND },
  { name: "Legend", min: 1000, color: DS_COLORS.milestoneGold },
];

type Props = { visible: boolean; onClose: () => void; currentPoints: number; currentRank: string };

export default function PointsExplainer({ visible, onClose, currentPoints, currentRank }: Props) {
  const currentRankData = RANKS.find((r) => r.name === currentRank) ?? RANKS[0];
  const nextRank = RANKS.find((r) => r.min > currentPoints);
  const pointsToNext = nextRank ? nextRank.min - currentPoints : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Discipline points</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} accessibilityLabel="Close">
            <X size={20} color={DS_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.statusCard}>
            <Text style={s.statusPoints}>{currentPoints}</Text>
            <Text style={s.statusLabel}>points</Text>
            <View style={[s.rankBadge, { backgroundColor: currentRankData?.color ?? DS_COLORS.DISCOVER_CORAL }]}>
              <Text style={s.rankBadgeText}>{currentRank}</Text>
            </View>
            {nextRank ? (
              <Text style={s.nextRankHint}>
                {pointsToNext} points to {nextRank.name}
              </Text>
            ) : null}
          </View>

          <Text style={s.sectionTitle}>How points work</Text>
          <Text style={s.sectionHint}>
            Points reward consistency. You earn them for showing up, and lose them for skipping. This isn&apos;t about
            perfection — it&apos;s about not quitting.
          </Text>
          {POINT_RULES.map((rule) => {
            const Icon = rule.icon;
            return (
              <View key={rule.action} style={s.ruleRow}>
                <Icon size={16} color={rule.color} />
                <Text style={s.ruleAction}>{rule.action}</Text>
                <Text
                  style={[
                    s.rulePoints,
                    { color: rule.points.startsWith("-") ? DS_COLORS.danger : DS_COLORS.DISCOVER_GREEN },
                  ]}
                >
                  {rule.points}
                </Text>
              </View>
            );
          })}

          <Text style={[s.sectionTitle, { marginTop: 24 }]}>Rank ladder</Text>
          {RANKS.map((rank) => {
            const isCurrent = rank.name === currentRank;
            return (
              <View key={rank.name} style={[s.rankRow, isCurrent && s.rankRowCurrent]}>
                <View style={[s.rankDot, { backgroundColor: rank.color }]} />
                <Text style={[s.rankName, isCurrent && { fontWeight: "700" }]}>{rank.name}</Text>
                <Text style={s.rankMin}>{rank.min}+ pts</Text>
              </View>
            );
          })}

          <Text style={s.footnote}>
            Points reset to 0 if you abandon all challenges. Your rank is permanent once earned — you keep the highest
            rank you&apos;ve reached.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DS_COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: DS_SPACING.xl, paddingBottom: 40 },
  statusCard: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  statusPoints: { fontSize: 48, fontWeight: "800", color: DS_COLORS.TEXT_PRIMARY },
  statusLabel: { fontSize: 14, color: DS_COLORS.TEXT_MUTED, marginTop: 2 },
  rankBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  rankBadgeText: { fontSize: 13, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
  nextRankHint: { marginTop: 8, fontSize: 12, color: DS_COLORS.TEXT_MUTED },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 8 },
  sectionHint: { fontSize: 13, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 20, marginBottom: 12 },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.chipFill,
  },
  ruleAction: { flex: 1, fontSize: 14, color: DS_COLORS.TEXT_PRIMARY },
  rulePoints: { fontSize: 14, fontWeight: "700" },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.chipFill,
  },
  rankRowCurrent: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rankDot: { width: 8, height: 8, borderRadius: 4 },
  rankName: { flex: 1, fontSize: 14, color: DS_COLORS.TEXT_PRIMARY },
  rankMin: { fontSize: 12, color: DS_COLORS.TEXT_MUTED },
  footnote: { marginTop: 20, fontSize: 11, color: DS_COLORS.TEXT_MUTED, lineHeight: 16 },
});
