/**
 * StatGrid — three-card horizontal bento grid below the StreakHero.
 *
 * Each card has identical anatomy:
 *   row 1: lucide icon (size 13) + uppercase label (9pt, letter-spaced)
 *   row 2: primary number / value (18pt, weight 500)
 *   row 3: visual indicator (3px-tall bar or 7-segment row)
 *
 * Variants reflect home state — they only swap copy + segment colors, not the
 * card geometry, so the grid never shifts row-height between renders.
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Calendar, Snowflake, Medal } from 'lucide-react-native';
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';

export type StatGridVariant = 'default' | 'day0' | 'atRisk' | 'secured';

export type StatGridProps = {
  weekSecured: number;
  weekTotal: number;
  freezesAvailable: number;
  freezesMaxPerWeek: number;
  nextBadgeName: string;
  nextBadgeProgress: number;
  /** Used by atRisk variant to render "{streak} days at stake". */
  streak?: number;
  variant?: StatGridVariant;
  onPressWeek?: () => void;
  onPressFreezes?: () => void;
  onPressBadge?: () => void;
};

// ──────────────────────────────────────────────────────────────────────────
// Card primitives
// ──────────────────────────────────────────────────────────────────────────

type CardProps = {
  label: string;
  icon: React.ReactNode;
  primary: string;
  sub?: string;
  subColor?: string;
  primaryColor?: string;
  indicator: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
};

function StatCard({
  label,
  icon,
  primary,
  sub,
  subColor,
  primaryColor,
  indicator,
  onPress,
  accessibilityLabel,
}: CardProps) {
  const content = (
    <>
      <View style={styles.topRow}>
        {icon}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.midCol}>
        <Text
          style={[styles.primary, primaryColor ? { color: primaryColor } : null]}
          numberOfLines={1}
        >
          {primary}
        </Text>
        {sub ? (
          <Text
            style={[styles.sub, subColor ? { color: subColor } : null]}
            numberOfLines={1}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <View style={styles.indicatorWrap}>{indicator}</View>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={styles.card}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      onPress={(_e: GestureResponderEvent) => onPress()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
    >
      {content}
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Indicators
// ──────────────────────────────────────────────────────────────────────────

function WeekSegments({
  weekSecured,
  weekTotal,
  variant,
}: {
  weekSecured: number;
  weekTotal: number;
  variant: StatGridVariant;
}) {
  const cells = [] as React.ReactElement[];
  for (let i = 0; i < weekTotal; i++) {
    let bg: string;
    if (variant === 'day0') {
      bg = DS_COLORS_V2.surface.cardChipNeutral;
    } else if (variant === 'atRisk' && i === weekTotal - 1) {
      bg = DS_COLORS_V2.semantic.danger;
    } else if (i < weekSecured) {
      bg = DS_COLORS_V2.brand.primary;
    } else if (i === weekSecured) {
      bg = DS_COLORS_V2.streak.flameMid;
    } else {
      bg = DS_COLORS_V2.surface.cardChipNeutral;
    }
    cells.push(<View key={i} style={[styles.weekSegment, { backgroundColor: bg }]} />);
  }
  return <View style={styles.weekRow}>{cells}</View>;
}

function ProgressBar({
  fraction,
  color,
  trackColor,
}: {
  fraction: number;
  color: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(1, fraction));
  return (
    <View
      style={[
        styles.progressTrack,
        { backgroundColor: trackColor ?? DS_COLORS_V2.surface.cardChipNeutral },
      ]}
    >
      <View
        style={[
          styles.progressFill,
          { width: `${clamped * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Variant copy
// ──────────────────────────────────────────────────────────────────────────

function freezeSubFor(variant: StatGridVariant): string {
  switch (variant) {
    case 'day0':
      return 'Saves a missed day';
    case 'atRisk':
      return 'Use one tonight';
    case 'secured':
      return 'Saved for later';
    default:
      return 'Next in 3 days';
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export function StatGrid(props: StatGridProps) {
  const {
    weekSecured,
    weekTotal,
    freezesAvailable,
    nextBadgeName,
    nextBadgeProgress,
    streak = 0,
    variant = 'default',
    onPressWeek,
    onPressFreezes,
    onPressBadge,
  } = props;

  // Card 1 — Week
  const weekCard = (
    <StatCard
      key="week"
      label="WEEK"
      icon={<Calendar size={13} color={DS_COLORS_V2.brand.primary} strokeWidth={1.75} />}
      primary={`${weekSecured}/${weekTotal}`}
      sub={variant === 'day0' ? 'Start today' : 'days secured'}
      indicator={
        <WeekSegments
          weekSecured={weekSecured}
          weekTotal={weekTotal}
          variant={variant}
        />
      }
      onPress={onPressWeek}
      accessibilityLabel={`Week progress, ${weekSecured} of ${weekTotal} days secured`}
    />
  );

  // Card 2 — Freezes
  const freezeSubColor =
    variant === 'atRisk' ? DS_COLORS_V2.streak.frozenStroke : undefined;
  const freezeCard = (
    <StatCard
      key="freezes"
      label="FREEZES"
      icon={
        <Snowflake size={13} color={DS_COLORS_V2.brand.primary} strokeWidth={1.75} />
      }
      primary={`${freezesAvailable} left`}
      sub={freezeSubFor(variant)}
      subColor={freezeSubColor}
      indicator={
        <ProgressBar
          fraction={
            props.freezesMaxPerWeek > 0
              ? freezesAvailable / props.freezesMaxPerWeek
              : 0
          }
          color={DS_COLORS_V2.streak.frozenStroke}
        />
      }
      onPress={onPressFreezes}
      accessibilityLabel={`Streak freezes, ${freezesAvailable} of ${props.freezesMaxPerWeek} available`}
    />
  );

  // Card 3 — Badge / Risk swap
  let thirdCard: React.ReactElement;
  if (variant === 'atRisk') {
    thirdCard = (
      <StatCard
        key="risk"
        label="RISK"
        icon={
          <Medal size={13} color={DS_COLORS_V2.semantic.danger} strokeWidth={1.75} />
        }
        primary={`${streak} day${streak === 1 ? '' : 's'}`}
        sub="at stake"
        primaryColor={DS_COLORS_V2.semantic.danger}
        subColor={DS_COLORS_V2.semantic.danger}
        indicator={
          <ProgressBar
            fraction={1}
            color={DS_COLORS_V2.semantic.danger}
            trackColor={DS_COLORS_V2.semantic.dangerSoft}
          />
        }
        onPress={onPressBadge}
        accessibilityLabel={`Streak at risk, ${streak} days at stake`}
      />
    );
  } else {
    const badgeName = variant === 'day0' ? 'First badge' : nextBadgeName;
    thirdCard = (
      <StatCard
        key="badge"
        label="NEXT BADGE"
        icon={
          <Medal size={13} color={DS_COLORS_V2.brand.primary} strokeWidth={1.75} />
        }
        primary={badgeName}
        sub={`${Math.round(nextBadgeProgress * 100)}%`}
        indicator={
          <ProgressBar
            fraction={variant === 'day0' ? 0 : nextBadgeProgress}
            color={DS_COLORS_V2.brand.primary}
          />
        }
        onPress={onPressBadge}
        accessibilityLabel={`Next badge ${badgeName}, ${Math.round(nextBadgeProgress * 100)} percent complete`}
      />
    );
  }

  return (
    <View style={styles.row}>
      {weekCard}
      {freezeCard}
      {thirdCard}
    </View>
  );
}

export default StatGrid;

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: DS_SPACING_V2.md,
  },
  card: {
    flex: 1,
    height: 88,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 0.5,
    borderColor: DS_COLORS_V2.surface.divider,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  midCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'nowrap',
  },
  primary: {
    fontSize: 18,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    flexShrink: 1,
  },
  sub: {
    fontSize: 10,
    color: DS_COLORS_V2.text.secondary,
    fontWeight: '400',
    flexShrink: 0,
  },
  indicatorWrap: {
    minHeight: 3,
    justifyContent: 'flex-end',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 2,
  },
  weekSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
});
