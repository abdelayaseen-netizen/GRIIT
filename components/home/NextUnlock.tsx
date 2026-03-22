import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Shield, Trophy } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

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
          <Icon size={18} color={DS_COLORS.DISCOVER_CORAL} />
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
    marginHorizontal: 24,
    backgroundColor: DS_COLORS.NEXT_UNLOCK_SURFACE,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.DISCOVER_CORAL,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  head: { fontSize: 13, fontWeight: "700", color: DS_COLORS.DISCOVER_INK },
  away: { fontSize: 10, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600" },
  row: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: DS_COLORS.NEXT_UNLOCK_ICON_BOX,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: DS_COLORS.DISCOVER_INK, marginBottom: 6 },
  barBg: {
    height: 4,
    backgroundColor: DS_COLORS.PROGRESS_TRACK_WARM,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, backgroundColor: DS_COLORS.DISCOVER_CORAL, borderRadius: 2 },
});
