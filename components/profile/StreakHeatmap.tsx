import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type StreakHeatmapProps = {
  days: { date: string; level: 0 | 1 | 2 | 3 | 4 }[];
};

const COLS = 5;
const GAP = 3;
const CELL_R = DS_RADIUS.featuredBadge;

const LEVEL_COLORS: readonly string[] = [
  DS_COLORS.HEATMAP_L0,
  DS_COLORS.HEATMAP_L1,
  DS_COLORS.HEATMAP_L2,
  DS_COLORS.HEATMAP_L3,
  DS_COLORS.HEATMAP_L4,
];

function todayUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StreakHeatmap({ days }: StreakHeatmapProps) {
  const { width: windowWidth } = useWindowDimensions();
  const outerPad = DS_SPACING.screenHorizontal * 2;
  const cardPad = 10 * 2;
  const usable = Math.max(0, windowWidth - outerPad - cardPad);
  const cell = useMemo(() => {
    const totalGaps = GAP * (COLS - 1);
    return Math.max(8, Math.floor((usable - totalGaps) / COLS));
  }, [usable]);

  const todayKey = todayUtcDateKey();
  const innerTodayR = Math.max(0, CELL_R - 3);

  return (
    <View style={styles.card} accessibilityRole="none" accessibilityLabel="Last thirty days streak heatmap">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Last 30 days</Text>
        <View style={styles.legend}>
          <Text style={styles.legendLbl}>Less</Text>
          {LEVEL_COLORS.map((c, idx) => (
            <View key={idx} style={[styles.legendSwatch, { backgroundColor: c }]} />
          ))}
          <Text style={styles.legendLbl}>More</Text>
        </View>
      </View>

      <View style={[styles.grid, { gap: GAP }]}>
        {days.map((d) => {
          const bg = LEVEL_COLORS[d.level] ?? LEVEL_COLORS[0];
          const isToday = d.date.slice(0, 10) === todayKey;
          return (
            <View
              key={d.date}
              style={{
                width: cell,
                height: cell,
                borderRadius: CELL_R,
              }}
              accessibilityElementsHidden
            >
              {isToday ? (
                <View
                  style={[
                    styles.todayRing,
                    {
                      width: cell,
                      height: cell,
                      borderRadius: CELL_R,
                      borderColor: DS_COLORS.HEATMAP_TODAY_RING,
                      padding: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.todayWhiteStroke,
                      {
                        width: cell - 3,
                        height: cell - 3,
                        borderRadius: innerTodayR,
                        borderColor: DS_COLORS.WHITE,
                        backgroundColor: bg,
                      },
                    ]}
                  />
                </View>
              ) : (
                <View style={{ flex: 1, backgroundColor: bg, borderRadius: CELL_R }} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.md,
    padding: 10,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.BG_CARD,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendLbl: { fontSize: 10, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY },
  legendSwatch: { width: 10, height: 10, borderRadius: DS_RADIUS.featuredBadge },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  todayRing: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD,
  },
  todayWhiteStroke: {
    borderWidth: 1,
  },
});
