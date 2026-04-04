import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Users, Target, Award } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

export interface SocialStatsCardProps {
  friendRank?: number | null;
  friendsCount: number;
  sharedChallenges?: number;
}

export default function SocialStatsCard({
  friendRank,
  friendsCount,
  sharedChallenges = 0,
}: SocialStatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Users size={18} color={DS_COLORS.textPrimary} />
        <Text style={styles.title}>Social</Text>
      </View>
      <View style={styles.row}>
        {friendRank != null && friendRank > 0 && (
          <View style={styles.stat}>
            <Target size={20} color={DS_COLORS.accent} />
            <Text style={styles.statValue}>#{friendRank}</Text>
            <Text style={styles.statLabel}>Weekly rank</Text>
          </View>
        )}
        <View style={styles.stat}>
          <Users size={20} color={DS_COLORS.textSecondary} />
          <Text style={styles.statValue}>{friendsCount}</Text>
          <Text style={styles.statLabel}>Accountability partners</Text>
        </View>
        <View style={styles.stat}>
          <Award size={20} color={DS_COLORS.textSecondary} />
          <Text style={styles.statValue}>{sharedChallenges}</Text>
          <Text style={styles.statLabel}>Shared challenges</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.md,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize - 2,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING.lg,
  },
  stat: {
    alignItems: "flex-start",
    minWidth: 80,
  },
  statValue: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.xs,
  },
  statLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
});
