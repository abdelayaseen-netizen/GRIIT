import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Shield, Trophy } from "lucide-react-native";
import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

const STREAK_MILESTONES = [
  { days: 3, name: "3-Day Streak badge", icon: "Flame" },
  { days: 7, name: "Week Warrior badge", icon: "Flame" },
  { days: 14, name: "2-Week Discipline badge", icon: "Shield" },
  { days: 30, name: "Monthly Master badge", icon: "Trophy" },
  { days: 75, name: "Legend badge", icon: "Trophy" },
] as const;

function getNextMilestone(currentStreak: number) {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak) ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
}

export default React.memo(function NextUnlock({ currentStreak }: { currentStreak: number }) {
  const next = getNextMilestone(currentStreak);
  if (!next) return null;
  const away = Math.max(0, next.days - currentStreak);
  const progress = Math.max(2, Math.min(100, (currentStreak / next.days) * 100));
  const Icon = next.icon === "Shield" ? Shield : next.icon === "Trophy" ? Trophy : Flame;
  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.head}>Next unlock</Text>
        <Text style={s.away}>{`${away} days away`}</Text>
      </View>
      <View style={s.row}>
        <View style={s.iconBox}>
          <Icon size={18} color={DS_COLORS.ACCENT} />
        </View>
        <View style={s.mid}>
          <Text style={s.title}>{next.name}</Text>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.NEXT_UNLOCK_SURFACE,
    borderRadius: DS_RADIUS.LG,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.ACCENT,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  head: { fontSize: 13, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.DISCOVER_INK },
  away: { fontSize: 11, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.ACCENT },
  row: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: DS_COLORS.NEXT_UNLOCK_ICON_BOX,
    borderRadius: DS_RADIUS.SM,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.DISCOVER_INK, marginBottom: 6 },
  barBg: {
    height: DS_MEASURES.PROGRESS_BAR_HEIGHT,
    backgroundColor: DS_COLORS.PROGRESS_TRACK_WARM,
    borderRadius: DS_RADIUS.SM,
    overflow: "hidden",
  },
  barFill: {
    height: DS_MEASURES.PROGRESS_BAR_HEIGHT,
    backgroundColor: DS_COLORS.ACCENT,
    borderRadius: DS_RADIUS.SM,
  },
});
