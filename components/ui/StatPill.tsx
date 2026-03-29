import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Flame, TrendingUp } from 'lucide-react-native';
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY, DS_MEASURES } from '@/lib/design-system';

interface StatPillProps {
  type: 'streak' | 'score';
  value: number;
  style?: ViewStyle;
}

export function StatPill({ type, value, style }: StatPillProps) {
  const isStreak = type === 'streak';
  const hasActiveStreak = isStreak && value > 0;

  return (
    <View
      style={[
        styles.pill,
        hasActiveStreak && styles.pillStreakActive,
        style,
      ]}
    >
      {isStreak ? (
        <Flame
          size={DS_MEASURES.ICON_SM}
          color={DS_COLORS.STREAK_ICON}
          fill={hasActiveStreak ? DS_COLORS.STREAK_ICON : DS_COLORS.TRANSPARENT}
        />
      ) : (
        <TrendingUp
          size={DS_MEASURES.ICON_SM}
          color={DS_COLORS.SCORE_ICON}
        />
      )}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.PILL,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER_CARD,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: DS_SPACING.XS,
  },
  pillStreakActive: {
    backgroundColor: DS_COLORS.STREAK_TINTED_BG,
  },
  value: {
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
});

export default StatPill;
