import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { Flame } from 'lucide-react-native';
import {
  DS_BUTTON,
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
  DS_TOUCH,
  DS_TYPE,
} from '@/lib/design-system';
import DarkHeroCard from '@/components/cards/DarkHeroCard';
import {
  Body,
  Caption,
  Display,
  Headline,
  Label,
} from '@/components/typography';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Streak number font sizing — preserves Display's 64pt default for 1–3 digit
 * streaks; drops to 56pt for 4-digit (1000–9999) and 48pt for 5-digit (10000+).
 * Per spec docs/design/DESIGN_SYSTEM_v2.md Part 6.
 */
function getStreakFontSize(streak: number): number {
  if (streak >= 10000) return 48;
  if (streak >= 1000) return 56;
  return 64;
}

/**
 * Window-remaining display: "{X}m left" under an hour, "{H}h {M}m" otherwise.
 * Used for both healthy ("19h 6m to keep it") and at-risk ("47m left") states.
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m left`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

// ============================================================================
// Props + state derivation
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

/**
 * State derivation, first-match-wins. Order is load-bearing — see review notes
 * in the prompt; reordering breaks edge case behavior. Specifically:
 *   1. lost beats every other rule (a 0 streak with prior history is the
 *      "comeback" surface, not a generic empty state)
 *   2. frozen beats atRisk (a freeze already secured today; don't show panic)
 *   3. atRisk beats day1/healthy (panic copy when window <60m and tasks left)
 *   4. day1 beats healthy (warmer copy on the very first day)
 *   5. healthy is the default
 */
function deriveState(p: Props): StreakState {
  if (p.streak === 0 && (p.lastStreak ?? 0) > 0) return 'lost';
  if (p.freezeUsedToday) return 'frozen';
  if (p.streak >= 1 && p.minutesRemaining < 60 && p.tasksRemaining > 0)
    return 'atRisk';
  if (p.streak === 1 && p.tasksRemaining > 0) return 'day1';
  return 'healthy';
}

// ============================================================================
// Sub-components (private to this file)
// ============================================================================

function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      style={{
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        marginTop: DS_SPACING_V2.md,
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: DS_COLORS_V2.brand.primaryOnDark,
        }}
      />
    </View>
  );
}

type ButtonVariant = 'primary' | 'ghost';

function HeroButton({
  children,
  onPress,
  variant,
  fullWidth = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  variant: ButtonVariant;
  fullWidth?: boolean;
}) {
  const backgroundColor =
    variant === 'primary'
      ? DS_COLORS_V2.brand.primaryOnDark
      : DS_BUTTON.ghostOnDark.backgroundColor;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          backgroundColor,
          borderRadius: DS_RADIUS_V2.md,
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: DS_TOUCH.minSize,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        },
        fullWidth ? { flex: 1 } : null,
      ]}
    >
      <Headline onDark style={{ textAlign: 'center' }}>
        {children}
      </Headline>
    </Pressable>
  );
}

const NOOP = () => {};

// ============================================================================
// Main component
// ============================================================================

export default function StreakHeroV2(props: Props) {
  const state = deriveState(props);
  const streakFontSize = getStreakFontSize(props.streak);
  const formattedStreak =
    props.streak >= 1000
      ? props.streak.toLocaleString()
      : String(props.streak);
  const tasksDone = Math.max(0, props.totalTasksToday - props.tasksRemaining);
  const progress =
    props.totalTasksToday > 0 ? tasksDone / props.totalTasksToday : 0;
  const dayWord = props.streak === 1 ? 'day' : 'days';

  // ---------- State 6: lost (comeback) ----------
  if (state === 'lost') {
    return (
      <DarkHeroCard surfaceVariant="heroDarkWarm">
        <Label onDark color="secondary">
          Day streak
        </Label>
        <View style={rowBaseline(DS_SPACING_V2.xs)}>
          <Display
            style={{ color: DS_COLORS_V2.text.onDarkSecondary, fontSize: 64 }}
          >
            0
          </Display>
          <Caption
            onDark
            color="secondary"
            style={{ marginLeft: DS_SPACING_V2.xs }}
          >
            days
          </Caption>
        </View>
        <Body
          onDark
          color="secondary"
          style={{ marginTop: DS_SPACING_V2.sm }}
        >
          {`Yesterday broke a ${props.lastStreak ?? 0}-day streak. Comebacks tend to last longer than first runs.`}
        </Body>
        <View style={buttonRow()}>
          <HeroButton
            variant="primary"
            fullWidth
            onPress={props.onStartComeback ?? NOOP}
          >
            Start day 1 →
          </HeroButton>
        </View>
      </DarkHeroCard>
    );
  }

  // ---------- State 4: frozen (freeze used today) ----------
  if (state === 'frozen') {
    return (
      <DarkHeroCard>
        <Label onDark color="secondary">
          Day streak · protected
        </Label>
        <View style={rowBaseline(DS_SPACING_V2.xs)}>
          <Display style={{ fontSize: streakFontSize }}>
            {formattedStreak}
          </Display>
          <Flame
            size={18}
            color={DS_COLORS_V2.text.onDarkSecondary}
            strokeWidth={1.5}
            style={{
              opacity: 0.7,
              marginLeft: DS_SPACING_V2.sm,
              alignSelf: 'center',
            }}
          />
        </View>
        <Caption
          onDark
          color="secondary"
          style={{ marginTop: DS_SPACING_V2.xs }}
        >
          {`Freeze used today · ${props.freezesAvailable} freezes left this month`}
        </Caption>
        <Caption
          onDark
          color="secondary"
          style={{ marginTop: DS_SPACING_V2.xs }}
        >
          Your streak is safe. You'll need a real task tomorrow.
        </Caption>
        <View style={buttonRow()}>
          <HeroButton
            variant="ghost"
            fullWidth
            onPress={props.onAcknowledgeFreezeUsed ?? NOOP}
          >
            Got it
          </HeroButton>
        </View>
      </DarkHeroCard>
    );
  }

  // ---------- State 3: atRisk ----------
  if (state === 'atRisk') {
    return (
      <DarkHeroCard
        borderWidth={1.5}
        borderColor={DS_COLORS_V2.semantic.dangerOnDark}
      >
        <Label
          onDark
          style={{ color: DS_COLORS_V2.semantic.dangerOnDarkText }}
        >
          At risk · Day streak
        </Label>
        <View style={rowBaseline(DS_SPACING_V2.xs)}>
          <Display style={{ fontSize: streakFontSize }}>
            {formattedStreak}
          </Display>
          <Caption
            onDark
            color="secondary"
            style={{ marginLeft: DS_SPACING_V2.xs }}
          >
            {dayWord}
          </Caption>
        </View>
        <Caption
          onDark
          color="secondary"
          style={{ marginTop: DS_SPACING_V2.xs }}
        >
          <Caption
            style={{
              color: DS_COLORS_V2.semantic.dangerOnDarkText,
              fontWeight: DS_TYPE.label.fontWeight,
            }}
          >
            {formatDuration(props.minutesRemaining)}
          </Caption>
          {' to keep it'}
          {props.freezesAvailable > 0
            ? ` · ${props.freezesAvailable} freeze available`
            : ''}
        </Caption>
        <ProgressBar progress={progress} />
        <View style={statRow()}>
          <Label onDark color="secondary">
            {tasksDone}/{props.totalTasksToday} done today
          </Label>
          {props.noonBonusPoints !== undefined ? (
            <Label onDark color="secondary">
              Noon bonus +{props.noonBonusPoints}
            </Label>
          ) : null}
        </View>
        <View style={buttonRow()}>
          <HeroButton
            variant="primary"
            fullWidth
            onPress={props.onSaveStreak ?? NOOP}
          >
            Save the streak
          </HeroButton>
          {props.freezesAvailable > 0 ? (
            <HeroButton
              variant="ghost"
              onPress={props.onUseFreeze ?? NOOP}
            >
              Use freeze
            </HeroButton>
          ) : null}
        </View>
      </DarkHeroCard>
    );
  }

  // ---------- States 1+2 (+5 sizing modifier): day1 / healthy (shared) ----------
  // Button copy is keyed off streak count.
  // - streak === 0: brand-new user pre-Day-1 (streak === 0 && lastStreak === 0).
  //   The lost-state branch above handles the comeback case (streak === 0
  //   && lastStreak > 0). This brand-new-user case falls through here and
  //   gets the no-arrow "Start day 1" CTA. NOT dead code — don't delete.
  // - streak === 1: first day in flight ("Start first task").
  // - streak >= 2: ongoing streak ("Continue today").
  const primaryButtonCopy =
    props.streak === 0
      ? 'Start day 1'
      : props.streak === 1
        ? 'Start first task'
        : 'Continue today';

  return (
    <DarkHeroCard>
      <Label onDark color="secondary">
        Day streak
      </Label>
      <View style={rowBaseline(DS_SPACING_V2.xs)}>
        <Display style={{ fontSize: streakFontSize }}>
          {formattedStreak}
        </Display>
        <Caption
          onDark
          color="secondary"
          style={{ marginLeft: DS_SPACING_V2.xs }}
        >
          {dayWord}
        </Caption>
      </View>
      <Caption
        onDark
        color="secondary"
        style={{ marginTop: DS_SPACING_V2.xs }}
      >
        <Caption
          style={{
            color: DS_COLORS_V2.brand.primaryOnDark,
            fontWeight: DS_TYPE.label.fontWeight,
          }}
        >
          {formatDuration(props.minutesRemaining)}
        </Caption>
        {' to keep it'}
        {props.freezesAvailable > 0
          ? ` · ${props.freezesAvailable} freeze available`
          : ''}
      </Caption>
      <ProgressBar progress={progress} />
      <View style={statRow()}>
        <Label onDark color="secondary">
          {tasksDone}/{props.totalTasksToday} done today
        </Label>
        {props.noonBonusPoints !== undefined ? (
          <Label onDark color="secondary">
            Noon bonus +{props.noonBonusPoints}
          </Label>
        ) : null}
      </View>
      <View style={buttonRow()}>
        <HeroButton
          variant="primary"
          fullWidth
          onPress={props.onStartFirstTask}
        >
          {primaryButtonCopy}
        </HeroButton>
        <HeroButton variant="ghost" onPress={props.onSkip ?? NOOP}>
          Skip
        </HeroButton>
      </View>
    </DarkHeroCard>
  );
}

// ============================================================================
// Layout helpers (factored out to keep JSX readable)
// ============================================================================

function rowBaseline(marginTop: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop,
  };
}

function statRow(): ViewStyle {
  return {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DS_SPACING_V2.xs,
  };
}

function buttonRow(): ViewStyle {
  return {
    flexDirection: 'row',
    gap: DS_SPACING_V2.xs,
    marginTop: DS_SPACING_V2.lg,
  };
}
