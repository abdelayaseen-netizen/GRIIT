import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system";

export interface DisciplineScoreCardProps {
  disciplineScore: number;
  tier: string;
  daysSecured?: number;
  friendRank?: number | null;
  /** Shown when disciplineScore is 0 to give context. */
  zeroStateHint?: string;
}

export default React.memo(function DisciplineScoreCard({
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
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    ...DS_SHADOWS.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: DS_COLORS.background,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.accent,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  score: {
    fontSize: 36,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginVertical: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  daysValue: {
    fontSize: 28,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  footerLabels: {},
  daysLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tierFooter: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  zeroStateHint: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
    fontStyle: "normal",
  },
  rankText: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
  },
});
