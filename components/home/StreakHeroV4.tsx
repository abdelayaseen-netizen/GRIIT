/**
 * StreakHeroV4 — Daylight v3 streak hero.
 *
 * Four states (derived from streak / tasksRemaining / minutesRemaining):
 *   day0       streak === 0           "Current streak" · 0 · "Post today to reach day 1."
 *   default    streak >= 1, mid-day   "Current streak" · N · next-badge caption
 *   atRisk     streak >= 1, < 60min   "Current streak" + countdown banner
 *   secured    all tasks done today   "Streak secured" + badge progress + dual CTA
 *
 * Daylight language: the "owned" streak is a calm stat that sits directly on the
 * canvas (big ink number + days + small accent flame). Today's tasks live inside
 * a pure-white "Today's proof" card with an accent post CTA. The shape stays
 * constant across states so the home reads calm.
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  Check,
  Clock,
  Snowflake,
} from 'lucide-react-native';
import { DS_DAYLIGHT } from '@/lib/design-system';
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
      <Clock size={16} color={DS_DAYLIGHT.color.accent} strokeWidth={2} />
      <Text style={styles.countdownText}>
        Streak ends in {minutesRemaining} minutes
      </Text>
    </View>
  );
}

function TaskRow({
  task,
  onPress,
}: {
  task: StreakHeroV4Task;
  onPress: () => void;
}) {
  const meta = task.done
    ? 'done'
    : task.proofType === 'photo'
      ? 'Photo'
      : 'Text';

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
        pressed && !task.done ? styles.rowPressed : null,
      ]}
    >
      <View
        style={[
          styles.taskCheck,
          task.done ? styles.taskCheckDone : styles.taskCheckPending,
        ]}
      >
        {task.done ? (
          <Check size={13} color={DS_DAYLIGHT.color.white} strokeWidth={3} />
        ) : null}
      </View>
      <Text style={styles.taskName} numberOfLines={1}>
        {task.name}
      </Text>
      <Text style={styles.taskMeta}>{meta}</Text>
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
// Header block (label + big number + days + flame + caption)
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
  let caption: string;

  switch (state) {
    case 'day0':
      label = 'Current streak';
      labelColor = DS_DAYLIGHT.color.inkMuted;
      caption = 'Post today to reach day 1.';
      break;
    case 'atRisk':
      label = 'Current streak';
      labelColor = DS_DAYLIGHT.color.accent;
      caption = "Don't break the chain.";
      break;
    case 'secured':
      label = 'Streak secured';
      labelColor = DS_DAYLIGHT.color.accent;
      caption = '+1 day stronger.';
      break;
    default: {
      label = 'Current streak';
      labelColor = DS_DAYLIGHT.color.inkMuted;
      const days = Math.max(0, nextBadgeDaysAway);
      caption =
        days <= 0
          ? `${nextBadgeName} unlocked`
          : `${days} more to your ${nextBadgeName} badge`;
      break;
    }
  }

  return (
    <View style={styles.headerBlock}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={styles.numberRow}>
        <Text style={styles.streakNumber}>{streak.toLocaleString()}</Text>
        <Text style={styles.daysWord}>days</Text>
        <View style={styles.flameWrap}>
          <StreakFlame streak={streak} state={flameState} size={22} />
        </View>
      </View>
      <Text style={styles.caption} numberOfLines={2}>
        {caption}
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// CTA blocks
// ──────────────────────────────────────────────────────────────────────────

function PrimaryCTA({
  label,
  onPress,
  withIcon = true,
}: {
  label: string;
  onPress: () => void;
  withIcon?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [styles.cta, pressed ? styles.rowPressed : null]}
    >
      {withIcon ? (
        <Camera size={18} color={DS_DAYLIGHT.color.white} strokeWidth={2} />
      ) : null}
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
        pressed && !disabled ? styles.rowPressed : null,
      ]}
    >
      <Snowflake
        size={16}
        color={
          disabled ? DS_DAYLIGHT.color.inkMuted3 : DS_DAYLIGHT.color.accent
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
        pressed ? styles.rowPressed : null,
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

  // Secured state — badge progress + dual CTA inside the white proof card.
  if (state === 'secured') {
    const segmentsTotal = 5;
    const filled = Math.min(
      segmentsTotal,
      props.streak % segmentsTotal || segmentsTotal,
    );
    return (
      <View style={styles.root}>
        <HeaderBlock
          state={state}
          streak={props.streak}
          nextBadgeName={props.nextBadgeName}
          nextBadgeDaysAway={props.nextBadgeDaysAway}
        />

        <View style={styles.proofCard}>
          <View style={styles.proofHeader}>
            <View style={styles.proofTitleCol}>
              <Text style={styles.proofTitle}>Streak secured</Text>
              <Text style={styles.proofSubtitle}>Next badge progress</Text>
            </View>
          </View>

          <View style={styles.badgeBlock}>
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
              withIcon={false}
              onPress={props.onPressSeeFeed ?? props.onPressPrimaryCTA}
            />
          </View>
        </View>
      </View>
    );
  }

  // day0 / default / atRisk
  const primaryCtaLabel =
    state === 'day0'
      ? 'Post your first proof'
      : state === 'atRisk'
        ? `Secure Day ${props.streak + 1}`
        : "Post today's proof";

  const subtitle =
    props.tasks.length > 0 && props.tasks[0]
      ? `${props.tasks[0].challengeName} · Day ${props.tasks[0].currentDay}`
      : undefined;

  const visibleTasks = props.tasks.slice(0, 4);

  return (
    <View style={styles.root}>
      {state === 'atRisk' ? (
        <CountdownBanner minutesRemaining={props.minutesRemaining} />
      ) : null}

      <HeaderBlock
        state={state}
        streak={props.streak}
        nextBadgeName={props.nextBadgeName}
        nextBadgeDaysAway={props.nextBadgeDaysAway}
      />

      <View style={styles.proofCard}>
        <View style={styles.proofHeader}>
          <View style={styles.proofTitleCol}>
            <Text style={styles.proofTitle}>Today&apos;s proof</Text>
            {subtitle ? (
              <Text style={styles.proofSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {props.totalTasksToday > 0 ? (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {`${tasksDone} / ${props.totalTasksToday}`}
              </Text>
            </View>
          ) : null}
        </View>

        {visibleTasks.length === 0 ? (
          <Text style={styles.emptyTasks}>
            No active challenges yet. Tap below to find one.
          </Text>
        ) : (
          <View style={styles.taskList}>
            {visibleTasks.map((task, idx) => (
              <React.Fragment key={task.id}>
                {idx > 0 ? <View style={styles.divider} /> : null}
                <TaskRow task={task} onPress={() => props.onPressTask(task)} />
              </React.Fragment>
            ))}
          </View>
        )}

        {state === 'atRisk' ? (
          <View style={styles.dualCtaRow}>
            <PrimaryCTA
              label={primaryCtaLabel}
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
            onPress={props.onPressPrimaryCTA}
          />
        )}
      </View>
    </View>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    gap: 22,
  },

  // ── Countdown banner (atRisk) ──
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  countdownText: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    flex: 1,
  },

  // ── Header (owned streak) ──
  headerBlock: {
    gap: 2,
  },
  label: {
    fontSize: DS_DAYLIGHT.size.eyebrow,
    fontWeight: DS_DAYLIGHT.weight.regular,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 2,
  },
  streakNumber: {
    fontSize: DS_DAYLIGHT.size.streakNumber,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -1.5,
    lineHeight: 68,
  },
  daysWord: {
    fontSize: 18,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted,
    marginBottom: 12,
  },
  flameWrap: {
    marginBottom: 12,
  },
  caption: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
    marginTop: 6,
  },

  // ── White "Today's proof" card ──
  proofCard: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    borderRadius: DS_DAYLIGHT.radius.card,
    padding: DS_DAYLIGHT.space.cardPad,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  proofTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  proofTitle: {
    fontSize: DS_DAYLIGHT.size.cardTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.2,
  },
  proofSubtitle: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted,
    marginTop: 3,
  },
  countPill: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    borderRadius: DS_DAYLIGHT.radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  countPillText: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },

  // ── Task rows ──
  taskList: {
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: DS_DAYLIGHT.color.divider,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },
  taskCheck: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckPending: {
    borderWidth: 2,
    borderColor: DS_DAYLIGHT.color.dashedBorder,
    backgroundColor: 'transparent',
  },
  taskCheckDone: {
    backgroundColor: DS_DAYLIGHT.color.ink,
  },
  taskName: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.ink,
  },
  taskMeta: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  emptyTasks: {
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.inkMuted,
    marginTop: 12,
    paddingVertical: 6,
  },

  // ── Badge progress (secured) ──
  badgeBlock: {
    marginTop: 16,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  badgeSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  badgeSegmentFilled: {
    backgroundColor: DS_DAYLIGHT.color.accent,
  },
  badgeSegmentEmpty: {
    backgroundColor: DS_DAYLIGHT.color.pillNeutral,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badgeDayLabel: {
    fontSize: DS_DAYLIGHT.size.dayLetter,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
    flex: 1,
    textAlign: 'center',
  },

  // ── CTAs ──
  dualCtaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  cta: {
    flex: 1,
    height: 52,
    borderRadius: DS_DAYLIGHT.radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: DS_DAYLIGHT.color.accent,
  },
  ctaText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  freezeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: DS_DAYLIGHT.radius.button,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
  },
  freezeBtnDisabled: {
    backgroundColor: 'transparent',
  },
  freezeBtnText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  freezeBtnTextDisabled: {
    color: DS_DAYLIGHT.color.inkMuted3,
  },
  ghostCta: {
    flex: 1,
    height: 52,
    borderRadius: DS_DAYLIGHT.radius.button,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    backgroundColor: DS_DAYLIGHT.color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostCtaText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
});
