import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
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
      const key = d.toISOString().split("T")[0];
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
        months.push(d.toLocaleString("en-US", { month: "short" }));
        lastMonth = m;
      }
    }
    return months.length ? months : ["Jan", "Feb", "Mar"];
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Discipline Calendar</Text>
        <Text style={styles.subtitle}>Secured days</Text>
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
          {cells.map((c, i) => (
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
              style={[styles.legendSquare, { backgroundColor: Colors.success + alpha }]}
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
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  streakLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  zeroStateHint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: "italic",
    marginBottom: 12,
  },
  gridWrap: {
    marginBottom: 10,
  },
  monthRow: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 4,
  },
  monthLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    width: 24,
  },
  cellsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  cell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.pill,
  },
  cellFilled: {
    backgroundColor: Colors.success + "88",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  legendSquares: {
    flexDirection: "row",
    gap: 2,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
