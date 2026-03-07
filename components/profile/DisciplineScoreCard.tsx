import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export interface DisciplineScoreCardProps {
  disciplineScore: number;
  tier: string;
  friendRank?: number | null;
  /** Shown when disciplineScore is 0 to give context. */
  zeroStateHint?: string;
}

export default function DisciplineScoreCard({
  disciplineScore,
  tier,
  friendRank,
  zeroStateHint,
}: DisciplineScoreCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Discipline Score</Text>
        <View style={styles.tierBadge}>
          <View style={styles.tierDot} />
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      </View>
      <Text style={styles.score}>{disciplineScore}</Text>
      <Text style={styles.tierFooter}>{tier} tier</Text>
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
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.pill,
    borderRadius: 12,
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
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  tierFooter: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
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
