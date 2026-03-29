import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";
import { formatMonthShort } from "@/lib/date-utils";
export interface DisciplineCalendarProps {
  securedDateKeys: string[];
  currentStreak: number;
  longestStreak: number;
}

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const TOTAL_CELLS = WEEKS * DAYS_PER_WEEK;

export default function DisciplineCalendar({
  securedDateKeys,
  currentStreak,
  longestStreak,
}: DisciplineCalendarProps) {
  const set = useMemo(() => new Set(securedDateKeys), [securedDateKeys]);

  const cells = useMemo(() => {
    const out: { key: string; secured: boolean }[] = [];
    const start = new Date();
    start.setDate(start.getDate() - TOTAL_CELLS + 1);
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, secured: set.has(key) });
    }
    return out;
  }, [set]);

  const monthLabels = useMemo(() => {
    const months: string[] = [];
    let lastMonth = -1;
    for (let i = 0; i < WEEKS; i++) {
      const d = new Date();
      d.setDate(d.getDate() - TOTAL_CELLS + 1 + i * 7);
      const m = d.getMonth();
      if (m !== lastMonth) {
        months.push(formatMonthShort(d));
        lastMonth = m;
      }
    }
    return months.length ? months : ["Jan", "Feb", "Mar"];
  }, []);

  const securedCount = securedDateKeys.length;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>{securedCount} day{securedCount === 1 ? "" : "s"} secured</Text>
      </View>
      <View style={styles.streakRow}>
        <Text style={styles.streakLabel}>Current streak: {currentStreak} days</Text>
        <Text style={styles.streakLabel}>Longest: {longestStreak} days</Text>
      </View>
      {currentStreak === 0 && longestStreak === 0 && (
        <Text style={styles.zeroStateHint}>Start your streak by completing today{"'"}s tasks.</Text>
      )}
      <View style={styles.gridWrap}>
        <View style={styles.monthRow}>
          {monthLabels.map((m, i) => (
            <Text key={i} style={styles.monthLabel}>{m}</Text>
          ))}
        </View>
        <View style={styles.cellsWrap}>
          {cells.map((c, _i) => (
            <View
              key={c.key}
              style={[
                styles.cell,
                c.secured && styles.cellFilled,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={styles.legendSquares}>
          {["22", "44", "88", "E8"].map((alpha, i) => (
            <View
              key={i}
              style={[styles.legendSquare, { backgroundColor: DS_COLORS.success + alpha }]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>More</Text>
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
  subtitle: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textMuted,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.md,
  },
  streakLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textSecondary,
  },
  zeroStateHint: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textSecondary,
    fontStyle: "normal",
    marginBottom: DS_SPACING.md,
  },
  gridWrap: {
    marginBottom: DS_SPACING.sm,
  },
  monthRow: {
    flexDirection: "row",
    marginBottom: 6,
    gap: DS_SPACING.xs,
  },
  monthLabel: {
    fontSize: 10,
    color: DS_COLORS.textSecondary,
    width: 24,
  },
  cellsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: DS_COLORS.borderAlt,
  },
  cellFilled: {
    backgroundColor: DS_COLORS.success,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
    marginTop: DS_SPACING.sm,
  },
  legendText: {
    fontSize: 10,
    color: DS_COLORS.textMuted,
  },
  legendSquares: {
    flexDirection: "row",
    gap: 2,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
