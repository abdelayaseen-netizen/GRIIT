/**
 * StreakHeroV4 — state-aware streak hero card.
 *
 * Four states (derived from streak / tasksRemaining / minutesRemaining):
 *   day0       streak === 0           label "Start your streak"
 *   default    streak >= 1, mid-day   label "Current streak"
 *   atRisk     streak >= 1, < 60min   label "Current streak" (red), countdown banner
 *   secured    all tasks done today   label "Streak secured" (yellow), badge bar, dual CTAs
 *
 * The shape of the card is constant across all states so the home stays calm —
 * the only differences are background tone, palette, and the bottom block
 * (task list vs. badge progress). Reuses StreakFlame for the visual.
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AlignLeft,
  Camera,
  Check,
  Clock,
  Snowflake,
} from 'lucide-react-native';
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';
import { StreakFlame, type StreakFlameState } from './StreakFlame';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type StreakHeroV4Task = {
  id: string;
  name: string;
  description: string;
  proofType: 'photo' | 'text';
  done: boolean;
  activeChallengeId: string;
  challengeId: string;
  challengeName: string;
  currentDay: number;
  durationDays: number;
  taskType: string;
  taskConfig: string;
};

export type StreakHeroV4State = 'day0' | 'default' | 'atRisk' | 'secured';

export type StreakHeroV4Props = {
  streak: number;
  lastStreak: number;
  minutesRemaining: number;
  tasksRemaining: number;
  totalTasksToday: number;
  freezesAvailable: number;
  freezeUsedToday: boolean;
  nextBadgeName: string;
  nextBadgeDaysAway: number;
  tasks: StreakHeroV4Task[];
  onPressTask: (task: StreakHeroV4Task) => void;
  onPressPrimaryCTA: () => void;
  onPressFreeze: () => void;
  onPressShare: () => void;
  /** Optional secondary CTA on secured state — defaults to no-op. */
  onPressSeeFeed?: () => void;
};

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

// ──────────────────────────────────────────────────────────────────────────
// State derivation (matches StreakHeroV3 priority order, 4-state simplified)
// ──────────────────────────────────────────────────────────────────────────

export function deriveStreakHeroV4State(
  p: Pick<
    StreakHeroV4Props,
    'streak' | 'tasksRemaining' | 'totalTasksToday' | 'minutesRemaining'
  >,
): StreakHeroV4State {
  if (p.tasksRemaining === 0 && p.totalTasksToday > 0) return 'secured';
  if (p.streak >= 1 && p.minutesRemaining < 60 && p.tasksRemaining > 0) {
    return 'atRisk';
  }
  if (p.streak === 0) return 'day0';
  return 'default';
}

function flameStateFor(
  heroState: StreakHeroV4State,
  streak: number,
): StreakFlameState {
  if (heroState === 'atRisk') return 'atRisk';
  if (heroState === 'day0') return 'day0';
  if (streak >= 30) return 'onFire';
  if (streak >= 7) return 'locked';
  return 'building';
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function CountdownBanner({ minutesRemaining }: { minutesRemaining: number }) {
  return (
    <View style={styles.countdownBanner} accessibilityRole="alert">
      <Clock
        size={14}
        color={DS_COLORS_V2.semantic.dangerOnDark}
        strokeWidth={2}
      />
      <Text style={styles.countdownText}>
        Streak ends in {minutesRemaining} minutes
      </Text>
    </View>
  );
}

function TaskRow({
  task,
  onPress,
  atRisk,
}: {
  task: StreakHeroV4Task;
  onPress: () => void;
  atRisk: boolean;
}) {
  const ProofIcon = task.proofType === 'photo' ? Camera : AlignLeft;
  const iconColor = task.done
    ? DS_COLORS_V2.semantic.success
    : atRisk
      ? DS_COLORS_V2.semantic.dangerOnDark
      : DS_COLORS_V2.brand.primaryOnDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={task.done}
      accessibilityRole="button"
      accessibilityLabel={
        task.done
          ? `Done: ${task.name}`
          : `Complete task: ${task.name}, ${task.proofType} proof`
      }
      accessibilityState={{ disabled: task.done }}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.taskRow,
        atRisk && !task.done ? styles.taskRowAtRisk : null,
        pressed && !task.done ? styles.taskRowPressed : null,
      ]}
    >
      <View
        style={[
          styles.taskCheck,
          task.done
            ? styles.taskCheckDone
            : atRisk
              ? styles.taskCheckAtRisk
              : styles.taskCheckPending,
        ]}
      >
        {task.done ? (
          <Check size={12} color={DS_COLORS_V2.text.onDark} strokeWidth={3} />
        ) : null}
      </View>
      <View style={styles.taskTextCol}>
        <Text
          style={[
            styles.taskName,
            task.done ? styles.taskNameDone : null,
          ]}
          numberOfLines={1}
        >
          {task.name}
        </Text>
        {task.description ? (
          <Text style={styles.taskDescription} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
      </View>
      <ProofIcon size={14} color={iconColor} strokeWidth={1.75} />
    </Pressable>
  );
}

function BadgeProgressBar({
  totalSegments,
  filled,
}: {
  totalSegments: number;
  filled: number;
}) {
  const cells = [] as React.ReactElement[];
  for (let i = 0; i < totalSegments; i++) {
    cells.push(
      <View
        key={i}
        style={[
          styles.badgeSegment,
          i < filled ? styles.badgeSegmentFilled : styles.badgeSegmentEmpty,
        ]}
      />,
    );
  }
  return <View style={styles.badgeRow}>{cells}</View>;
}

// ──────────────────────────────────────────────────────────────────────────
// Header block (label + number + sub + flame)
// ──────────────────────────────────────────────────────────────────────────

function HeaderBlock({
  state,
  streak,
  nextBadgeName,
  nextBadgeDaysAway,
}: {
  state: StreakHeroV4State;
  streak: number;
  nextBadgeName: string;
  nextBadgeDaysAway: number;
}) {
  const flameState = flameStateFor(state, streak);

  let label: string;
  let labelColor: string;
  let numberColor: string;
  let numberSize: number;
  let sub: string;
  let subColor: string;

  switch (state) {
    case 'day0':
      label = 'Start your streak';
      labelColor = DS_COLORS_V2.text.onDarkSecondary;
      numberColor = DS_COLORS_V2.text.tertiaryDark;
      numberSize = 48;
      sub = 'Post proof to light the fire';
      subColor = DS_COLORS_V2.text.onDarkSecondary;
      break;
    case 'atRisk':
      label = 'Current streak';
      labelColor = DS_COLORS_V2.semantic.dangerOnDarkText;
      numberColor = DS_COLORS_V2.semantic.dangerOnDark;
      numberSize = 48;
      sub = "Don't break the chain";
      subColor = DS_COLORS_V2.semantic.dangerOnDarkText;
      break;
    case 'secured':
      label = 'Streak secured';
      labelColor = DS_COLORS_V2.streak.securedYellow;
      numberColor = DS_COLORS_V2.brand.primaryOnDark;
      numberSize = 54;
      sub = '+1 day stronger';
      subColor = DS_COLORS_V2.streak.securedYellow;
      break;
    default: {
      label = 'Current streak';
      labelColor = DS_COLORS_V2.text.onDarkSecondary;
      numberColor = DS_COLORS_V2.brand.primaryOnDark;
      numberSize = 48;
      const days = Math.max(0, nextBadgeDaysAway);
      sub =
        days <= 0
          ? `${nextBadgeName} unlocked`
          : `${days} more to your ${nextBadgeName} badge`;
      subColor = DS_COLORS_V2.text.onDarkSecondary;
      break;
    }
  }

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerTextCol}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Text
          style={[
            styles.streakNumber,
            { color: numberColor, fontSize: numberSize },
          ]}
        >
          {streak.toLocaleString()}
        </Text>
        <Text style={[styles.sub, { color: subColor }]} numberOfLines={2}>
          {sub}
        </Text>
      </View>
      <StreakFlame streak={streak} state={flameState} size={64} />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// CTA blocks
// ──────────────────────────────────────────────────────────────────────────

function PrimaryCTA({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'default' | 'atRisk';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.cta,
        variant === 'atRisk' ? styles.ctaAtRisk : styles.ctaDefault,
        pressed ? styles.ctaPressed : null,
      ]}
    >
      <Text style={styles.ctaText}>{label}</Text>
    </Pressable>
  );
}

function FreezeButton({
  onPress,
  freezesAvailable,
}: {
  onPress: () => void;
  freezesAvailable: number;
}) {
  const disabled = freezesAvailable <= 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        disabled
          ? 'No streak freezes available'
          : `Use a streak freeze, ${freezesAvailable} available`
      }
      accessibilityState={{ disabled }}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.freezeBtn,
        disabled ? styles.freezeBtnDisabled : null,
        pressed && !disabled ? styles.ctaPressed : null,
      ]}
    >
      <Snowflake
        size={14}
        color={
          disabled
            ? DS_COLORS_V2.text.onDarkTertiary
            : DS_COLORS_V2.streak.frozenOuter
        }
        strokeWidth={2}
      />
      <Text
        style={[
          styles.freezeBtnText,
          disabled ? styles.freezeBtnTextDisabled : null,
        ]}
      >
        Freeze
      </Text>
    </Pressable>
  );
}

function SecondaryGhostCTA({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.ghostCta,
        pressed ? styles.ctaPressed : null,
      ]}
    >
      <Text style={styles.ghostCtaText}>{label}</Text>
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────

export function StreakHeroV4(props: StreakHeroV4Props) {
  const state = deriveStreakHeroV4State(props);

  const tasksDone = Math.max(0, props.totalTasksToday - props.tasksRemaining);
  const taskHeader =
    state === 'atRisk'
      ? 'Still to do today'
      : state === 'day0'
        ? 'Your first challenge'
        : "Today's challenges";

  // Container background swap (atRisk vs everything else)
  const containerStyle = [
    styles.card,
    state === 'atRisk' ? styles.cardAtRisk : styles.cardDefault,
  ];

  // Secured state — replace task list + CTA
  if (state === 'secured') {
    const segmentsTotal = 5;
    const filled = Math.min(segmentsTotal, props.streak % segmentsTotal || segmentsTotal);
    return (
      <View style={containerStyle}>
        <HeaderBlock
          state={state}
          streak={props.streak}
          nextBadgeName={props.nextBadgeName}
          nextBadgeDaysAway={props.nextBadgeDaysAway}
        />

        <View style={styles.middleBlock}>
          <BadgeProgressBar totalSegments={segmentsTotal} filled={filled} />
          <View style={styles.badgeLabelRow}>
            {Array.from({ length: segmentsTotal }, (_, i) => (
              <Text key={i} style={styles.badgeDayLabel}>
                Day {i + 1}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.dualCtaRow}>
          <SecondaryGhostCTA
            label="Share streak"
            onPress={props.onPressShare}
          />
          <PrimaryCTA
            label="See feed"
            variant="default"
            onPress={props.onPressSeeFeed ?? props.onPressPrimaryCTA}
          />
        </View>
      </View>
    );
  }

  // day0 / default / atRisk
  const primaryCtaLabel =
    state === 'day0'
      ? 'Post your first proof'
      : `Secure Day ${props.streak + 1}`;

  return (
    <View style={containerStyle}>
      {state === 'atRisk' ? (
        <CountdownBanner minutesRemaining={props.minutesRemaining} />
      ) : null}

      <HeaderBlock
        state={state}
        streak={props.streak}
        nextBadgeName={props.nextBadgeName}
        nextBadgeDaysAway={props.nextBadgeDaysAway}
      />

      <View style={styles.middleBlock}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskHeaderLabel}>{taskHeader}</Text>
          <Text style={styles.taskHeaderCount}>
            {`${tasksDone} of ${props.totalTasksToday} done`}
          </Text>
        </View>

        {props.tasks.length === 0 ? (
          <Text style={styles.emptyTasks}>
            No active challenges yet. Tap below to find one.
          </Text>
        ) : (
          <View style={styles.taskList}>
            {props.tasks.slice(0, 4).map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onPress={() => props.onPressTask(task)}
                atRisk={state === 'atRisk'}
              />
            ))}
          </View>
        )}
      </View>

      {state === 'atRisk' ? (
        <View style={styles.dualCtaRow}>
          <PrimaryCTA
            label={primaryCtaLabel}
            variant="atRisk"
            onPress={props.onPressPrimaryCTA}
          />
          <FreezeButton
            onPress={props.onPressFreeze}
            freezesAvailable={props.freezesAvailable}
          />
        </View>
      ) : (
        <PrimaryCTA
          label={primaryCtaLabel}
          variant="default"
          onPress={props.onPressPrimaryCTA}
        />
      )}
    </View>
  );
}

export default StreakHeroV4;

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.md,
  },
  cardDefault: {
    backgroundColor: DS_COLORS_V2.surface.heroNeutral,
  },
  cardAtRisk: {
    backgroundColor: DS_COLORS_V2.surface.heroDanger,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.semantic.danger,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderWidth: 0.5,
    borderColor: DS_COLORS_V2.semantic.danger,
    alignSelf: 'flex-start',
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '500',
    color: DS_COLORS_V2.semantic.dangerOnDark,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING_V2.md,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  streakNumber: {
    fontWeight: '500',
    letterSpacing: -1,
    marginTop: 2,
    lineHeight: 56,
  },
  sub: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },

  middleBlock: {
    gap: DS_SPACING_V2.xs,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  taskHeaderLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
  taskHeaderCount: {
    fontSize: 11,
    fontWeight: '400',
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  emptyTasks: {
    fontSize: 12,
    color: DS_COLORS_V2.text.onDarkSecondary,
    paddingVertical: 6,
  },
  taskList: {
    gap: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 0.5,
    borderColor: DS_COLORS_V2.overlay.onDarkBorder08,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface04,
  },
  taskRowAtRisk: {
    borderColor: DS_COLORS_V2.semantic.dangerOnDark,
  },
  taskRowPressed: {
    opacity: 0.85,
  },
  taskCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  taskCheckPending: {
    borderColor: DS_COLORS_V2.brand.primaryOnDark,
    backgroundColor: 'transparent',
  },
  taskCheckAtRisk: {
    borderColor: DS_COLORS_V2.semantic.dangerOnDark,
    backgroundColor: 'transparent',
  },
  taskCheckDone: {
    borderColor: DS_COLORS_V2.semantic.success,
    backgroundColor: DS_COLORS_V2.semantic.success,
  },
  taskTextCol: {
    flex: 1,
    minWidth: 0,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
  taskNameDone: {
    color: DS_COLORS_V2.text.onDarkSecondary,
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  taskDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: DS_COLORS_V2.text.onDarkSecondary,
    marginTop: 1,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  badgeSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  badgeSegmentFilled: {
    backgroundColor: DS_COLORS_V2.brand.primaryOnDark,
  },
  badgeSegmentEmpty: {
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badgeDayLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDarkSecondary,
    flex: 1,
    textAlign: 'center',
  },

  dualCtaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cta: {
    flex: 1,
    height: 44,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDefault: {
    backgroundColor: DS_COLORS_V2.brand.primaryOnDark,
  },
  ctaAtRisk: {
    backgroundColor: DS_COLORS_V2.semantic.dangerOnDark,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryText,
  },
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.streak.frozenOuter,
    backgroundColor: DS_COLORS_V2.overlay.frozenTint08,
  },
  freezeBtnDisabled: {
    borderColor: DS_COLORS_V2.text.onDarkTertiary,
    backgroundColor: 'transparent',
  },
  freezeBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.streak.frozenOuter,
  },
  freezeBtnTextDisabled: {
    color: DS_COLORS_V2.text.onDarkTertiary,
  },
  ghostCta: {
    flex: 1,
    height: 44,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.overlay.onDarkBorder25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostCtaText: {
    fontSize: 15,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
});
