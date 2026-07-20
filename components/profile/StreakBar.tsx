/**
 * StreakBar — dark 3-column bar showing current streak / best streak / active runs.
 *
 * Active column is the only tap-target (when `onPressActive` is provided); it
 * opens the active-challenges sheet. Current streak number uses the OLED-corrected
 * brand orange so the brand identity stays visible at small sizes.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';

export type StreakBarProps = {
  currentStreak: number;
  longestStreak: number;
  activeCount: number;
  onPressActive?: () => void;
};

function unitWord(value: number, singular: string, plural?: string): string {
  if (value === 1) return singular;
  return plural ?? `${singular}s`;
}

type ColumnProps = {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  onPress?: () => void;
  pressLabel?: string;
};

function StreakColumn({
  label,
  value,
  unit,
  highlight,
  onPress,
  pressLabel,
}: ColumnProps) {
  const numberStyle = highlight ? styles.numberHighlight : styles.number;
  const inner = (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={numberStyle}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={pressLabel ?? `${label} ${value} ${unit}`}
        hitSlop={4}
        style={({ pressed }) => [styles.columnPressable, pressed ? styles.columnPressed : null]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.columnPressable}>{inner}</View>;
}

export const StreakBar = React.memo(function StreakBar({
  currentStreak,
  longestStreak,
  activeCount,
  onPressActive,
}: StreakBarProps) {
  return (
    <View style={styles.card}>
      <StreakColumn
        label="CURRENT"
        value={currentStreak}
        unit={unitWord(currentStreak, 'day')}
        highlight
      />
      <View style={styles.divider} />
      <StreakColumn
        label="BEST"
        value={longestStreak}
        unit={unitWord(longestStreak, 'day')}
      />
      <View style={styles.divider} />
      <StreakColumn
        label="ACTIVE"
        value={activeCount}
        unit={activeCount === 0 ? 'now' : unitWord(activeCount, 'run')}
        onPress={onPressActive}
        pressLabel={`Active challenges, ${activeCount}, view list`}
      />
    </View>
  );
});


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: DS_COLORS_V2.surface.heroNeutral,
    borderRadius: DS_RADIUS_V2.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  divider: {
    width: 1,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface05,
    marginHorizontal: DS_SPACING_V2.xs,
  },
  columnPressable: {
    flex: 1,
  },
  columnPressed: {
    opacity: 0.85,
  },
  column: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.onDarkSecondary,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  number: {
    fontSize: 24,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  numberHighlight: {
    fontSize: 24,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryOnDark,
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: DS_COLORS_V2.text.onDarkSecondary,
    paddingBottom: 2,
  },
});
