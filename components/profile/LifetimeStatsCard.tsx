import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Trophy, Target, Award } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface LifetimeStatsCardProps {
  longestStreak: number;
  daysSecured: number;
  challengesCompleted: number;
  totalDisciplinePoints: number;
}

const statStyles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  cell: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.tertiary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

export default function LifetimeStatsCard({
  longestStreak,
  daysSecured,
  challengesCompleted,
  totalDisciplinePoints,
}: LifetimeStatsCardProps) {
  const safe = (n: number) => Math.max(0, Number(n) || 0);
  const items = [
    { icon: <Flame size={20} color={Colors.streak.fire} />, value: safe(longestStreak), label: "Longest streak" },
    { icon: <Target size={20} color={Colors.streak.shield} />, value: safe(daysSecured), label: "Days secured" },
    { icon: <Award size={20} color={Colors.accent} />, value: safe(challengesCompleted), label: "Challenges completed" },
    { icon: <Trophy size={20} color={Colors.milestone.gold} />, value: safe(totalDisciplinePoints), label: "Discipline points" },
  ];

  return (
    <View style={statStyles.grid}>
      {items.map((item, i) => (
        <View key={i} style={statStyles.cell}>
          <View style={statStyles.iconWrap}>{item.icon}</View>
          <Text style={statStyles.value}>{item.value}</Text>
          <Text style={statStyles.label}>{item.label.toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
}
