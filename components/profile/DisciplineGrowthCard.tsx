import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

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
          <TrendingUp size={24} color={DS_COLORS.textSecondary} />
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.lg,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.md,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  periodPill: {
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: DS_SPACING.xs,
    borderRadius: DS_RADIUS.input / 2,
    backgroundColor: DS_COLORS.chipFill,
  },
  periodPillText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.md,
  },
  uppercase: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
  },
  value: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
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
    gap: DS_SPACING.sm,
    marginTop: 2,
  },
  deltaBadge: {
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: 2,
    borderRadius: DS_RADIUS.input / 2,
    backgroundColor: DS_COLORS.success,
  },
  deltaText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: DS_COLORS.chipFill,
    overflow: "hidden",
    flexDirection: "row",
  },
  barFill: {
    height: "100%",
    backgroundColor: DS_COLORS.success,
    borderRadius: 4,
  },
});
