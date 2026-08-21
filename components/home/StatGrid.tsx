/**
 * StatGrid — Daylight v3 week strip.
 *
 * In the Daylight language the home's week visualization is a calm 7-column
 * strip: a single-letter weekday over a tall rounded bar. Completed days read
 * as solid ink, today carries the accent-tint highlight, future days stay
 * neutral. The freeze + next-badge entry points are preserved as quiet,
 * tappable footer chips so their navigation/analytics survive the reskin.
 *
 * Variants reflect home state — they only swap copy + bar colors, never the
 * geometry, so the strip never shifts height between renders.
 * Today's cell can be both today and completed (filled ink + accent border).
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Snowflake, Medal } from 'lucide-react-native';
import { DS_DAYLIGHT } from '@/lib/design-system';

export type StatGridVariant = 'default' | 'day0' | 'atRisk' | 'secured';

export type StatGridProps = {
  /** Count of secured days this week — for copy. Derive from weekSecuredByIndex. */
  weekSecured: number;
  weekTotal: number;
  /**
   * Length-7 flags (Mon→Sun): true when that cell's date key is in securedDateKeys.
   * Fill condition — do not use weekSecured count as an index threshold.
   */
  weekSecuredByIndex: boolean[];
  /** Monday-first index of today in the profile-timezone week (0–6). */
  todayWeekIndex: number;
  freezesAvailable: number;
  freezesMaxPerWeek: number;
  nextBadgeName: string;
  nextBadgeProgress: number;
  /** Used by atRisk variant to render "{streak} days at risk". */
  streak?: number;
  variant?: StatGridVariant;
  onPressWeek?: () => void;
  onPressFreezes?: () => void;
  onPressBadge?: () => void;
};

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

// Monday-first single-letter weekday labels.
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/** Today's index in a Monday-first week (Mon = 0 … Sun = 6). Device-local — prefer todayWeekIndex prop. */
function mondayFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// ──────────────────────────────────────────────────────────────────────────
// Week strip
// ──────────────────────────────────────────────────────────────────────────

type DayKind = 'completed' | 'today' | 'todayCompleted' | 'future';

function WeekStrip({
  weekSecuredByIndex,
  weekTotal,
  todayWeekIndex,
  variant,
}: {
  weekSecuredByIndex: boolean[];
  weekTotal: number;
  todayWeekIndex: number;
  variant: StatGridVariant;
}) {
  const todayIndex =
    todayWeekIndex >= 0 && todayWeekIndex < 7
      ? todayWeekIndex
      : mondayFirstIndex(new Date());
  const total = Math.min(7, Math.max(1, weekTotal));

  const cells = [] as React.ReactElement[];
  for (let i = 0; i < total; i++) {
    let kind: DayKind;
    if (i === todayIndex) {
      // Today can also be secured — don't let the today check hide a fill.
      kind =
        weekSecuredByIndex[i] === true ? 'todayCompleted' : 'today';
    } else if (variant !== 'day0' && weekSecuredByIndex[i] === true) {
      kind = 'completed';
    } else {
      kind = 'future';
    }

    const barStyle =
      kind === 'completed'
        ? styles.dayBarDone
        : kind === 'todayCompleted'
          ? styles.dayBarTodayDone
          : kind === 'today'
            ? styles.dayBarToday
            : styles.dayBarFuture;

    const isToday = kind === 'today' || kind === 'todayCompleted';

    cells.push(
      <View key={i} style={styles.dayCol}>
        <Text
          style={isToday ? styles.dayLetterToday : styles.dayLetter}
        >
          {DAY_LETTERS[i]}
        </Text>
        <View style={[styles.dayBar, barStyle]} />
      </View>,
    );
  }

  return <View style={styles.weekRow}>{cells}</View>;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function StatGrid(props: StatGridProps) {
  const {
    weekSecured,
    weekTotal,
    weekSecuredByIndex,
    todayWeekIndex,
    freezesAvailable,
    nextBadgeName,
    nextBadgeProgress,
    streak = 0,
    variant = 'default',
    onPressWeek,
    onPressFreezes,
    onPressBadge,
  } = props;

  const securedLabel =
    variant === 'day0'
      ? 'Start today'
      : `${weekSecured} of ${weekTotal} days secured this week`;

  const freezePlural = freezesAvailable === 1 ? '' : 's';
  const badgeName = variant === 'day0' ? 'First badge' : nextBadgeName;
  const badgeText =
    variant === 'atRisk'
      ? `${streak} day${streak === 1 ? '' : 's'} at risk`
      : `${badgeName} · ${Math.round(nextBadgeProgress * 100)}%`;

  const strip = (
    <WeekStrip
      weekSecuredByIndex={weekSecuredByIndex}
      weekTotal={weekTotal}
      todayWeekIndex={todayWeekIndex}
      variant={variant}
    />
  );

  return (
    <View style={styles.root}>
      {onPressWeek ? (
        <Pressable
          onPress={(_e: GestureResponderEvent) => onPressWeek()}
          accessibilityRole="button"
          accessibilityLabel={securedLabel}
          style={({ pressed }) => (pressed ? styles.pressed : null)}
        >
          {strip}
        </Pressable>
      ) : (
        <View accessibilityRole="text" accessibilityLabel={securedLabel}>
          {strip}
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable
          onPress={onPressFreezes}
          disabled={!onPressFreezes}
          accessibilityRole="button"
          accessibilityLabel={`Streak freezes, ${freezesAvailable} available`}
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [
            styles.chip,
            pressed && onPressFreezes ? styles.pressed : null,
          ]}
        >
          <Snowflake
            size={13}
            color={DS_DAYLIGHT.color.accent}
            strokeWidth={1.75}
          />
          <Text style={styles.chipText} numberOfLines={1}>
            {`${freezesAvailable} freeze${freezePlural} left`}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPressBadge}
          disabled={!onPressBadge}
          accessibilityRole="button"
          accessibilityLabel={
            variant === 'atRisk'
              ? `Streak at risk, ${streak} ${streak === 1 ? 'day' : 'days'} at stake`
              : `Next badge ${badgeName}, ${Math.round(nextBadgeProgress * 100)} percent complete`
          }
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [
            styles.chip,
            pressed && onPressBadge ? styles.pressed : null,
          ]}
        >
          <Medal
            size={13}
            color={DS_DAYLIGHT.color.accent}
            strokeWidth={1.75}
          />
          <Text
            style={[
              styles.chipText,
              variant === 'atRisk' ? styles.chipTextAlert : null,
            ]}
            numberOfLines={1}
          >
            {badgeText}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
  },
  pressed: {
    opacity: 0.7,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 7,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLetter: {
    fontSize: DS_DAYLIGHT.size.dayLetter,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted3,
  },
  dayLetterToday: {
    fontSize: DS_DAYLIGHT.size.dayLetter,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  dayBar: {
    width: '100%',
    height: 36,
    borderRadius: 11,
  },
  dayBarDone: {
    backgroundColor: DS_DAYLIGHT.color.ink,
  },
  dayBarToday: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    borderWidth: 2,
    borderColor: DS_DAYLIGHT.color.accent,
  },
  dayBarTodayDone: {
    backgroundColor: DS_DAYLIGHT.color.ink,
    borderWidth: 2,
    borderColor: DS_DAYLIGHT.color.accent,
  },
  dayBarFuture: {
    backgroundColor: DS_DAYLIGHT.color.pillNeutral,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  chipText: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
    flexShrink: 1,
  },
  chipTextAlert: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.medium,
  },
});
