import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Flame } from 'lucide-react-native';
import {
  DS_BUTTON,
  DS_COLORS,
  DS_RADIUS,
  DS_TOUCH,
} from '@/lib/design-system';

// ============================================================================
// Helpers (ported from StreakHeroV2)
// ============================================================================

function getStreakFontSize(streak: number): number {
  if (streak >= 10000) return 48;
  if (streak >= 1000) return 56;
  return 64;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m left`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function filledDotCount(streak: number): number {
  if (streak <= 0) return 0;
  return streak % 3 || 3;
}

function badgeProgressLabel(streak: number): string {
  if (streak < 3) {
    const remaining = 3 - streak;
    return remaining === 1
      ? '1 day to first badge'
      : `${remaining} days to first badge`;
  }
  const filled = filledDotCount(streak);
  const untilNext = filled === 3 ? 3 : 3 - filled;
  return untilNext === 1
    ? '1 day to next badge'
    : `${untilNext} days to next badge`;
}

// ============================================================================
// Props + state derivation (identical to StreakHeroV2)
// ============================================================================

type Props = {
  streak: number;
  lastStreak?: number;
  minutesRemaining: number;
  tasksRemaining: number;
  totalTasksToday: number;
  freezesAvailable: number;
  freezeUsedToday: boolean;
  noonBonusPoints?: number;
  onStartFirstTask: () => void;
  onSaveStreak?: () => void;
  onUseFreeze?: () => void;
  onAcknowledgeFreezeUsed?: () => void;
  onSkip?: () => void;
  onStartComeback?: () => void;
};

type StreakState = 'lost' | 'frozen' | 'atRisk' | 'day1' | 'healthy';

function deriveState(p: Props): StreakState {
  if (p.streak === 0 && (p.lastStreak ?? 0) > 0) return 'lost';
  if (p.freezeUsedToday) return 'frozen';
  if (p.streak >= 1 && p.minutesRemaining < 60 && p.tasksRemaining > 0)
    return 'atRisk';
  if (p.streak === 1 && p.tasksRemaining > 0) return 'day1';
  return 'healthy';
}

function getMetaLine(state: StreakState, p: Props): string {
  if (p.streak === 0 && p.tasksRemaining > 0) {
    if (p.minutesRemaining < 60) {
      return `${p.minutesRemaining}m to start day 1`;
    }
    return `${formatDuration(p.minutesRemaining)} to start day 1`;
  }
  if (state === 'day1' || p.streak === 1) {
    return 'Day 1 done · build the habit';
  }
  if (p.streak >= 2) {
    if (p.minutesRemaining < 60) {
      return `${p.minutesRemaining}m left to keep your streak`;
    }
    return `${formatDuration(p.minutesRemaining)} to keep it alive`;
  }
  return `${formatDuration(p.minutesRemaining)} to keep it alive`;
}

const NOOP = () => {};

// ============================================================================
// Sub-components
// ============================================================================

function WhiteHeroCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function FlameInlineRow({
  streak,
  metaLine,
  metaColor,
}: {
  streak: number;
  metaLine: string;
  metaColor?: string;
}) {
  const streakFontSize = getStreakFontSize(streak);
  const formattedStreak =
    streak >= 1000 ? streak.toLocaleString() : String(streak);

  return (
    <View style={styles.heroRow}>
      <View
        style={styles.flameCircle}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Flame
          size={13}
          color={DS_COLORS.TEXT_ON_ACCENT}
          strokeWidth={2}
        />
      </View>
      <View style={styles.heroTextCol}>
        <View style={styles.numRow}>
          <Text
            style={[styles.streakNum, { fontSize: streakFontSize }]}
            accessibilityRole="text"
          >
            {formattedStreak}
          </Text>
          <Text style={styles.dayStreakLabel}>day streak</Text>
        </View>
        <Text style={[styles.metaLine, metaColor ? { color: metaColor } : null]}>
          {metaLine}
        </Text>
      </View>
    </View>
  );
}

function DotProgressRow({ streak }: { streak: number }) {
  const filled = filledDotCount(streak);
  return (
    <View style={styles.dotsRow}>
      <View style={styles.dotsGroup} accessibilityRole="progressbar">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>
      <Text style={styles.badgeLabel}>{badgeProgressLabel(streak)}</Text>
    </View>
  );
}

function LightHeroButton({
  label,
  onPress,
  variant,
  fullWidth = false,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'ghost';
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        variant === 'primary' ? styles.btnPrimary : styles.btnGhost,
        fullWidth ? styles.btnFullWidth : null,
        pressed ? styles.btnPressed : null,
      ]}
    >
      <Text
        style={variant === 'primary' ? styles.btnPrimaryText : styles.btnGhostText}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * TODO(PR #19): lost / frozen / atRisk layouts are stubbed for the bold-home
 * ship; full light-variant surfaces will ship in a follow-up PR.
 */
function StateStub({
  stateName,
  actionLabel,
  onPress,
}: {
  stateName: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <WhiteHeroCard>
      <Text style={styles.stubHint}>
        {`${stateName} — stubbed for PR #19`}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={({ pressed }) => [styles.stubTap, pressed ? styles.btnPressed : null]}
      >
        <Text style={styles.stubTapText}>{actionLabel}</Text>
      </Pressable>
    </WhiteHeroCard>
  );
}

function HealthyDay1Card(props: Props & { heroState: 'healthy' | 'day1' }) {
  const { heroState: state } = props;
  const tasksDone = Math.max(0, props.totalTasksToday - props.tasksRemaining);
  const primaryButtonCopy =
    props.streak === 0
      ? 'Start day 1'
      : props.streak === 1
        ? 'Start first task'
        : 'Continue today';
  const metaLine = getMetaLine(state, props);

  return (
    <WhiteHeroCard>
      <FlameInlineRow streak={props.streak} metaLine={metaLine} />
      <DotProgressRow streak={props.streak} />
      <View style={styles.statRow}>
        <Text style={styles.statText}>
          {`${tasksDone}/${props.totalTasksToday} done today`}
        </Text>
        {props.noonBonusPoints !== undefined ? (
          <Text style={styles.statText}>
            {`Noon bonus +${props.noonBonusPoints}`}
          </Text>
        ) : null}
      </View>
      <View style={styles.buttonRow}>
        <LightHeroButton
          variant="primary"
          fullWidth
          label={primaryButtonCopy}
          onPress={props.onStartFirstTask}
        />
        <LightHeroButton
          variant="ghost"
          label="Skip"
          onPress={props.onSkip ?? NOOP}
        />
      </View>
    </WhiteHeroCard>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function StreakHeroV3(props: Props) {
  const state = deriveState(props);

  // TODO(PR #19): lost / frozen / atRisk — stubbed; polish light layouts in follow-up.
  if (state === 'lost') {
    return (
      <StateStub
        stateName="Lost streak"
        actionLabel="Start day 1"
        onPress={props.onStartComeback ?? NOOP}
      />
    );
  }

  if (state === 'frozen') {
    return (
      <StateStub
        stateName="Frozen streak"
        actionLabel="Got it"
        onPress={props.onAcknowledgeFreezeUsed ?? NOOP}
      />
    );
  }

  if (state === 'atRisk') {
    return (
      <StateStub
        stateName="At-risk streak"
        actionLabel="Save the streak"
        onPress={props.onSaveStreak ?? NOOP}
      />
    );
  }

  return <HealthyDay1Card {...props} heroState={state} />;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flameCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DS_COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakNum: {
    fontWeight: '500',
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 64,
  },
  dayStreakLabel: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  metaLine: {
    marginTop: 4,
    fontSize: 10,
    color: DS_COLORS.ACCENT,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  dotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotFilled: {
    backgroundColor: DS_COLORS.ACCENT,
  },
  dotEmpty: {
    backgroundColor: DS_COLORS.BORDER,
  },
  badgeLabel: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statText: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: DS_COLORS.ACCENT,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFullWidth: {
    flex: 1,
  },
  btnGhost: {
    backgroundColor: DS_BUTTON.secondary.backgroundColor,
    borderWidth: DS_BUTTON.secondary.borderWidth,
    borderColor: DS_BUTTON.secondary.borderColor,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: DS_COLORS.TEXT_ON_ACCENT,
  },
  btnGhostText: {
    fontSize: 15,
    fontWeight: '600',
    color: DS_COLORS.TEXT_PRIMARY,
  },
  stubHint: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  stubTap: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: DS_TOUCH.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stubTapText: {
    fontSize: 14,
    fontWeight: '600',
    color: DS_COLORS.ACCENT,
  },
});
