import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame, Trophy, Target, Award } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

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
    { icon: Flame, color: DS_COLORS.accent, bg: DS_COLORS.accentSoft, value: safe(currentStreak), label: "STREAK" },
    { icon: Trophy, color: DS_COLORS.warning, bg: DS_COLORS.warningSoft, value: safe(longestStreak), label: "BEST" },
    { icon: Target, color: DS_COLORS.success, bg: DS_COLORS.successSoft, value: safe(daysSecured), label: "SECURED" },
    { icon: Award, color: DS_COLORS.accent, bg: DS_COLORS.accentSoft, value: safe(challengesCompleted), label: "DONE" },
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
    paddingVertical: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: DS_COLORS.border,
    alignSelf: "stretch",
  },
  iconWrap: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.sm,
  },
  value: {
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  label: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
});
