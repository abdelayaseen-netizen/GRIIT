import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp } from "lucide-react-native";
import Colors from "@/constants/colors";
import { designTokens } from "@/lib/design-tokens";

export interface DisciplineGrowthCardProps {
  /** Value 30 days ago (e.g. 0) */
  pastValue: number;
  /** Current value (e.g. 12) */
  currentValue: number;
  /** Delta to show as green badge, e.g. +12 */
  delta: number;
  /** Label for period, e.g. "30 days" */
  periodLabel?: string;
}

export default function DisciplineGrowthCard({
  pastValue,
  currentValue,
  delta,
  periodLabel = "30 days",
}: DisciplineGrowthCardProps) {
  const progress = currentValue > 0 ? Math.min(1, pastValue / currentValue) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Discipline Growth</Text>
        <View style={styles.periodPill}>
          <Text style={styles.periodPillText}>{periodLabel}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View>
          <Text style={styles.uppercase}>30 DAYS AGO</Text>
          <Text style={styles.value}>{pastValue}</Text>
        </View>
        <View style={styles.iconWrap}>
          <TrendingUp size={24} color={Colors.text.secondary} />
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.uppercase}>CURRENT</Text>
          <View style={styles.currentRow}>
            <Text style={styles.value}>{currentValue}</Text>
            <View style={styles.deltaBadge}>
              <Text style={styles.deltaText}>+{delta}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: designTokens.cardRadius,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...designTokens.cardShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  periodPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.pill,
  },
  periodPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  uppercase: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text.muted,
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 2,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  rightCol: {},
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  deltaText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pill,
    overflow: "hidden",
    flexDirection: "row",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
});
