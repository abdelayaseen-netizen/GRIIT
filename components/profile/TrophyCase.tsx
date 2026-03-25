import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Flame, Shield, Award, Target, Flag, Trophy } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type Snapshot = {
  streak: number;
  goalsCompleted: number;
  challengesCompleted: number;
};

type Badge = {
  id: string;
  name: string;
  icon: "Flame" | "Shield" | "Award" | "Target" | "Flag" | "Trophy";
  target: number;
  unit: string;
  getCurrent: (s: Snapshot) => number;
};

const NEXT_BADGES: Badge[] = [
  { id: "streak3", name: "3-Day Fire", icon: "Flame", target: 3, unit: "days", getCurrent: (s) => s.streak },
  { id: "streak7", name: "Week Warrior", icon: "Shield", target: 7, unit: "days", getCurrent: (s) => s.streak },
  { id: "streak14", name: "Fortnight", icon: "Award", target: 14, unit: "days", getCurrent: (s) => s.streak },
  { id: "goals10", name: "Goal Getter", icon: "Target", target: 10, unit: "goals", getCurrent: (s) => s.goalsCompleted },
  { id: "challenge1", name: "First Blood", icon: "Flag", target: 1, unit: "done", getCurrent: (s) => s.challengesCompleted },
  { id: "challenge3", name: "Hat Trick", icon: "Trophy", target: 3, unit: "done", getCurrent: (s) => s.challengesCompleted },
];

function iconFor(name: Badge["icon"]) {
  if (name === "Shield") return Shield;
  if (name === "Award") return Award;
  if (name === "Target") return Target;
  if (name === "Flag") return Flag;
  if (name === "Trophy") return Trophy;
  return Flame;
}

export default React.memo(function TrophyCase(props: Snapshot) {
  const cards = useMemo(() => {
    const upcoming = NEXT_BADGES.filter((b) => b.getCurrent(props) < b.target);
    return upcoming.slice(0, 3);
  }, [props]);

  return (
    <View style={s.wrap}>
      <Text style={s.header}>Next badges</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {cards.map((b) => {
          const current = b.getCurrent(props);
          const pct = Math.max(2, Math.min(100, Math.round((current / b.target) * 100)));
          const Icon = iconFor(b.icon);
          const iconColor = pct >= 50 ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.DISCOVER_META_SILVER;
          return (
            <View
              key={b.id}
              style={s.card}
              accessibilityRole="none"
              accessibilityLabel={`${b.name} — ${Math.min(current, b.target)} of ${b.target} ${b.unit} complete`}
            >
              <View style={s.iconWrap}>
                <Icon size={16} color={iconColor} />
              </View>
              <Text style={s.name}>{b.name}</Text>
              <Text style={s.progress}>{`${Math.min(current, b.target)}/${b.target} ${b.unit}`}</Text>
              <View style={s.track}>
                <View style={[s.fill, { width: `${pct}%` }]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: { fontSize: 13, fontWeight: "700", color: DS_COLORS.DISCOVER_INK, paddingHorizontal: 24, marginBottom: 10 },
  row: { paddingHorizontal: 24, paddingRight: 32 },
  card: {
    width: 100,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.TROPHY_ICON_WRAP_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { marginTop: 8, fontSize: 11, fontWeight: "600", color: DS_COLORS.DISCOVER_INK, textAlign: "center" },
  progress: { marginTop: 2, fontSize: 10, color: DS_COLORS.TEXT_MUTED },
  track: {
    width: "100%",
    marginTop: 6,
    height: 3,
    backgroundColor: DS_COLORS.PROGRESS_TRACK_WARM,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: { height: 3, backgroundColor: DS_COLORS.DISCOVER_CORAL },
});
