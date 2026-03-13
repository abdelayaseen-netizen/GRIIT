import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Trophy, Target, Award } from "lucide-react-native";
import Colors from "@/constants/colors";
import { GRIIT_RADII, GRIIT_SHADOWS } from "@/src/theme";

export interface LifetimeStatsCardProps {
  currentStreak?: number;
  longestStreak: number;
  daysSecured: number;
  challengesCompleted: number;
  totalDisciplinePoints?: number;
}

const ICON_CIRCLE = 36;

export default function LifetimeStatsCard({
  currentStreak = 0,
  longestStreak,
  daysSecured,
  challengesCompleted,
  totalDisciplinePoints = 0,
}: LifetimeStatsCardProps) {
  const safe = (n: number) => Math.max(0, Number(n) || 0);
  const items = [
    { icon: Flame, color: Colors.accent, bg: Colors.accentLight, value: safe(currentStreak), label: "STREAK" },
    { icon: Trophy, color: Colors.streak.gold, bg: "#FFFBEB", value: safe(longestStreak), label: "BEST" },
    { icon: Target, color: Colors.success, bg: Colors.successLight, value: safe(daysSecured), label: "SECURED" },
    { icon: Award, color: Colors.accent, bg: Colors.accentLight, value: safe(challengesCompleted), label: "DONE" },
  ];

  return (
    <View style={styles.card}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.cell}>
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Icon size={18} color={item.color} />
              </View>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: GRIIT_RADII.card,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    ...GRIIT_SHADOWS.card,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#F0EDE8",
    alignSelf: "stretch",
  },
  iconWrap: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
