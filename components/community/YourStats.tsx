import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

function StatRow({
  label,
  value,
  isLast,
  mutedValue = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  mutedValue?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, mutedValue && styles.valueMuted]}>{value}</Text>
    </View>
  );
}

export const YourStats = React.memo(function YourStats({
  goalsSecuredToday,
  weeklyRank,
  pointsThisWeek,
  activeChallenges,
}: {
  goalsSecuredToday: number;
  weeklyRank: number | null;
  pointsThisWeek: number;
  activeChallenges: number;
}) {
  const weeklyRankLabel = weeklyRank == null ? "Unranked" : `#${weeklyRank}`;

  return (
    <View>
      <Text style={styles.sectionTitle}>Your stats</Text>
      <View style={styles.card}>
        <StatRow label="Goals secured today" value={String(goalsSecuredToday)} />
        <StatRow label="Weekly rank" value={weeklyRankLabel} mutedValue={weeklyRank == null} />
        <StatRow label="Points this week" value={String(pointsThisWeek)} />
        <StatRow label="Active challenges" value={String(activeChallenges)} isLast />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_INK,
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.DISCOVER_DIVIDER,
  },
  label: {
    fontSize: 13,
    color: DS_COLORS.buttonDisabledText,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_INK,
  },
  valueMuted: {
    color: DS_COLORS.TEXT_MUTED,
  },
});
