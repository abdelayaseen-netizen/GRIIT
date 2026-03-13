import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system";

export interface DisciplineScoreCardProps {
  disciplineScore: number;
  tier: string;
  daysSecured?: number;
  friendRank?: number | null;
  /** Shown when disciplineScore is 0 to give context. */
  zeroStateHint?: string;
}

export default function DisciplineScoreCard({
  disciplineScore,
  tier,
  daysSecured,
  friendRank,
  zeroStateHint,
}: DisciplineScoreCardProps) {
  const days = daysSecured ?? disciplineScore;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>DISCIPLINE SCORE</Text>
        <View style={styles.tierBadge}>
          <View style={styles.tierDot} />
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      </View>
      <Text style={styles.score}>{disciplineScore}</Text>
      <View style={styles.divider} />
      <View style={styles.footerRow}>
        <Text style={styles.daysValue}>{days}</Text>
        <View style={styles.footerLabels}>
          <Text style={styles.daysLabel}>DAYS SECURED</Text>
          <Text style={styles.tierFooter}>{tier} tier</Text>
        </View>
      </View>
      {disciplineScore === 0 && zeroStateHint && (
        <Text style={styles.zeroStateHint}>{zeroStateHint}</Text>
      )}
      {friendRank != null && friendRank > 0 && (
        <Text style={styles.rankText}>#{friendRank} among participants this week</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.xl,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.md,
    ...DS_SHADOWS.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.sm,
  },
  label: {
    fontSize: DS_TYPOGRAPHY.tabLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: DS_SPACING.xs,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.chipFill,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.accent,
  },
  tierText: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.borderAlt,
    marginVertical: DS_SPACING.lg,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
  },
  daysValue: {
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  footerLabels: {},
  daysLabel: {
    fontSize: DS_TYPOGRAPHY.tabLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
  },
  tierFooter: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  zeroStateHint: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
    fontStyle: "italic",
  },
  rankText: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
  },
});
