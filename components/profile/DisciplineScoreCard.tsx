import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { designTokens } from "@/lib/design-tokens";

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
    backgroundColor: Colors.card,
    borderRadius: designTokens.cardRadius,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...designTokens.cardShadow,
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
    color: Colors.text.muted,
    letterSpacing: 1,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.pill,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EDE8",
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
    color: Colors.text.primary,
  },
  footerLabels: {},
  daysLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text.muted,
    letterSpacing: 1,
  },
  tierFooter: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  zeroStateHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 10,
    fontStyle: "italic",
  },
  rankText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
});
