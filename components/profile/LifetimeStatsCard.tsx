import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Trophy, Target, Award } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

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
  totalDisciplinePoints: _totalDisciplinePoints = 0,
}: LifetimeStatsCardProps) {
  const safe = (n: number) => Math.max(0, Number(n) || 0);
  const items = [
    { icon: Flame, color: DS_COLORS.accent, value: safe(currentStreak), label: "STREAK" },
    { icon: Trophy, color: "#D4A017", value: safe(longestStreak), label: "BEST" },
    { icon: Target, color: DS_COLORS.success, value: safe(daysSecured), label: "SECURED" },
    { icon: Award, color: DS_COLORS.accent, value: safe(challengesCompleted), label: "DONE" },
  ];

  return (
    <View style={styles.card}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <View key={i} style={styles.cell}>
            <View style={styles.iconWrap}>
              <Icon size={18} color={item.color} />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F6F2",
    borderRadius: 12,
    paddingVertical: 16,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#AAAAAA",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
