import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Trophy, Target, Award } from "lucide-react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

export interface LifetimeStatsCardProps {
  currentStreak?: number;
  longestStreak: number;
  daysSecured: number;
  challengesCompleted: number;
  activeChallengesCount?: number;
  totalDisciplinePoints?: number;
}

const ICON_CIRCLE = 36;

export default React.memo(function LifetimeStatsCard({
  currentStreak = 0,
  longestStreak,
  daysSecured: _daysSecured,
  challengesCompleted,
  activeChallengesCount = 0,
  totalDisciplinePoints: _totalDisciplinePoints = 0,
}: LifetimeStatsCardProps) {
  const safe = (n: number) => Math.max(0, Number(n) || 0);
  const items = [
    { icon: Flame, color: DS_COLORS.accent, value: safe(currentStreak), label: "STREAK", sublabel: "days" },
    { icon: Trophy, color: DS_COLORS.milestoneGold, value: safe(longestStreak), label: "BEST", sublabel: "days" },
    { icon: Target, color: DS_COLORS.success, value: safe(activeChallengesCount), label: "ACTIVE", sublabel: "challenges" },
    { icon: Award, color: DS_COLORS.accent, value: safe(challengesCompleted), label: "DONE", sublabel: "completed" },
  ];

  return (
    <View style={styles.card}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.cell}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
                <Icon size={18} color={item.color} />
              </View>
              <Text style={styles.value}>{item.value}</Text>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.sublabel}>{item.sublabel}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: DS_RADIUS.button,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.surface,
    padding: 16,
    gap: 0,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.border,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 24,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
});
