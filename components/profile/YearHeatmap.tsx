/**
 * YearHeatmap — 52 × 7 grid of activity levels for the last 365 days.
 *
 * `days` is expected to be ordered oldest → newest, with up to 365 entries.
 * Cells beyond the last entry render in the dedicated `heatmap.future` tone so
 * the calendar always reads as a full 52-week block. Decorative; no taps.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
  DS_TYPOGRAPHY,
} from '@/lib/design-system';

export type YearHeatmapDay = {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
};

export type YearHeatmapProps = {
  days: YearHeatmapDay[];
  totalSecured: number;
  rangeLabelStart?: string;
  rangeLabelEnd?: string;
};

const COLUMNS = 52;
const ROWS = 7;
const CELL = 5;
const GAP = 2;
const PITCH = CELL + GAP;
const SVG_WIDTH = COLUMNS * PITCH - GAP;
const SVG_HEIGHT = ROWS * PITCH - GAP;

const LEVEL_COLORS: readonly string[] = [
  DS_COLORS_V2.heatmap.L0,
  DS_COLORS_V2.heatmap.L1,
  DS_COLORS_V2.heatmap.L2,
  DS_COLORS_V2.heatmap.L3,
  DS_COLORS_V2.heatmap.L4,
];

const FUTURE_COLOR = DS_COLORS_V2.heatmap.future;

const LEGEND_LEVELS: readonly (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4];

export const YearHeatmap = React.memo(function YearHeatmap({
  days,
  totalSecured,
  rangeLabelStart,
  rangeLabelEnd,
}: YearHeatmapProps) {
  const total = COLUMNS * ROWS;
  const lastIndex = days.length - 1;
  const a11y = `Activity heatmap, ${totalSecured} days secured in last ${days.length || 365} days`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          Last {days.length || 365} days · {totalSecured} secured
        </Text>
      </View>

      <View
        accessibilityRole="image"
        accessibilityLabel={a11y}
        style={styles.gridWrap}
      >
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
          {Array.from({ length: total }).map((_, i) => {
            const col = Math.floor(i / ROWS);
            const row = i % ROWS;
            const isFuture = i > lastIndex;
            const day = days[i];
            const level = day?.level ?? 0;
            const fill = isFuture
              ? FUTURE_COLOR
              : (LEVEL_COLORS[level] ?? LEVEL_COLORS[0]) as string;
            return (
              <Rect
                key={`${col}-${row}`}
                x={col * PITCH}
                y={row * PITCH}
                width={CELL}
                height={CELL}
                rx={1}
                ry={1}
                fill={fill}
              />
            );
          })}
        </Svg>
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>{rangeLabelStart ?? ''}</Text>
        <View style={styles.legendCenter}>
          <Text style={styles.legendHint}>Less</Text>
          <View style={styles.legendCells}>
            {LEGEND_LEVELS.map((lvl) => (
              <View
                key={lvl}
                style={[
                  styles.legendCell,
                  { backgroundColor: LEVEL_COLORS[lvl] },
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendHint}>More</Text>
        </View>
        <Text style={[styles.legendLabel, styles.legendLabelEnd]}>
          {rangeLabelEnd ?? ''}
        </Text>
      </View>
    </View>
  );
});

export default YearHeatmap;

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: DS_SPACING_V2.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  gridWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DS_SPACING_V2.sm,
  },
  legendLabel: {
    fontSize: 10,
    color: DS_COLORS_V2.text.tertiary,
    minWidth: 60,
  },
  legendLabelEnd: {
    textAlign: 'right',
  },
  legendCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendHint: {
    fontSize: 10,
    color: DS_COLORS_V2.text.tertiary,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR,
  },
  legendCells: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    width: 8,
    height: 8,
    borderRadius: 1.5,
  },
});
