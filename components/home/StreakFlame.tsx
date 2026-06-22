/**
 * StreakFlame — state-aware SVG flame icon for the home streak hero.
 *
 * States map to visual treatment:
 *   day0       → cool grey, smallest, single inner blob
 *   building   → orange (1–6 days), 2 layers, base size
 *   locked     → orange (7–29 days), 3 layers + hot center, larger
 *   onFire     → orange (30+ days), 4 layers (deepest stroke + center spark), largest
 *   atRisk     → red, base size — pulses urgency
 *   frozen     → blue + crossed snowflake glyph, base size
 *
 * The flame paths are a hand-tuned bezier silhouette (control points on the
 * 48×60 viewBox). For the larger `locked` and `onFire` variants we swap in a
 * proportionally taller path so the flame reads as more intense, not just
 * scaled up. The accessibility label always carries the streak count + state
 * so the screen reader announces something useful.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DS_DAYLIGHT } from '@/lib/design-system';

export type StreakFlameState =
  | 'day0'
  | 'building'
  | 'locked'
  | 'onFire'
  | 'atRisk'
  | 'frozen';

export type StreakFlameProps = {
  streak: number;
  state: StreakFlameState;
  /** Width and height of the rendered SVG square. Defaults to 52. */
  size?: number;
};

// ──────────────────────────────────────────────────────────────────────────
// Path shapes (all on the same 48 × 60 viewBox so they layer cleanly)
// ──────────────────────────────────────────────────────────────────────────

/** Base outer flame silhouette — used by building/atRisk/frozen. */
const FLAME_OUTER_BASE =
  'M24 8 C 28 14, 36 18, 36 30 C 36 44, 28 52, 24 52 C 20 52, 12 44, 12 30 C 12 18, 20 14, 24 8 Z';

/** Base inner flame — slightly tucked inside the outer silhouette. */
const FLAME_INNER_BASE =
  'M24 20 C 26 24, 30 26, 30 32 C 30 40, 27 44, 24 44 C 21 44, 18 40, 18 32 C 18 26, 22 24, 24 20 Z';

/** Larger outer for locked (taller, slightly broader shoulders). */
const FLAME_OUTER_LOCKED =
  'M24 4 C 29 11, 38 15, 38 30 C 38 46, 29 56, 24 56 C 19 56, 10 46, 10 30 C 10 15, 19 11, 24 4 Z';

/** Larger inner for locked. */
const FLAME_INNER_LOCKED =
  'M24 16 C 27 21, 32 24, 32 32 C 32 41, 28 47, 24 47 C 20 47, 16 41, 16 32 C 16 24, 21 21, 24 16 Z';

/** Largest outer for onFire (most aggressive bezier shoulder). */
const FLAME_OUTER_ON_FIRE =
  'M24 2 C 30 9, 40 13, 40 30 C 40 48, 30 58, 24 58 C 18 58, 8 48, 8 30 C 8 13, 18 9, 24 2 Z';

/** Largest mid layer for onFire. */
const FLAME_MID_ON_FIRE =
  'M24 12 C 28 18, 35 22, 35 32 C 35 44, 29 51, 24 51 C 19 51, 13 44, 13 32 C 13 22, 20 18, 24 12 Z';

/** Inner core for onFire — sits inside the mid layer. */
const FLAME_INNER_ON_FIRE =
  'M24 22 C 26 26, 30 28, 30 34 C 30 40, 27 45, 24 45 C 21 45, 18 40, 18 34 C 18 28, 22 26, 24 22 Z';

const VIEW_BOX = '0 0 48 60';

// ──────────────────────────────────────────────────────────────────────────
// State → palette
// ──────────────────────────────────────────────────────────────────────────

type Palette = {
  outer: string;
  outerStroke: string;
  inner: string;
  hotspot?: string;
  center?: string;
};

function paletteFor(state: StreakFlameState): Palette {
  const c = DS_DAYLIGHT.color;
  // Daylight uses ONE orange selection language — the flame reads as a calm,
  // solid accent glyph. day0/frozen drop to neutral ink-muted tones.
  switch (state) {
    case 'day0':
      return {
        outer: c.iconMuted,
        outerStroke: c.iconMuted,
        inner: c.pillNeutral,
      };
    case 'building':
      return {
        outer: c.accent,
        outerStroke: c.accent,
        inner: c.accentTint,
      };
    case 'locked':
      return {
        outer: c.accent,
        outerStroke: c.accent,
        inner: c.accentTint,
        hotspot: c.white,
      };
    case 'onFire':
      return {
        outer: c.accent,
        outerStroke: c.accent,
        inner: c.accentTint,
        hotspot: c.white,
        center: c.accent,
      };
    case 'atRisk':
      return {
        outer: c.accent,
        outerStroke: c.accent,
        inner: c.accentTint,
      };
    case 'frozen':
      return {
        outer: c.inkMuted3,
        outerStroke: c.inkMuted2,
        inner: c.pillNeutral,
      };
  }
}

function describeState(state: StreakFlameState, streak: number): string {
  switch (state) {
    case 'day0':
      return 'Streak flame, no streak yet';
    case 'building':
      return `Streak flame, day ${streak}, building`;
    case 'locked':
      return `Streak flame, day ${streak}, locked in`;
    case 'onFire':
      return `Streak flame, day ${streak}, on fire`;
    case 'atRisk':
      return `Streak flame, day ${streak}, at risk`;
    case 'frozen':
      return `Streak flame, day ${streak}, frozen`;
  }
}

export function StreakFlame({ streak, state, size = 52 }: StreakFlameProps) {
  const p = paletteFor(state);

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityRole="image"
      accessibilityLabel={describeState(state, streak)}
    >
      <Svg width={size} height={size} viewBox={VIEW_BOX}>
        {state === 'onFire' ? (
          <>
            <Path
              d={FLAME_OUTER_ON_FIRE}
              fill={p.outer}
              stroke={p.outerStroke}
              strokeWidth={1.5}
            />
            <Path d={FLAME_MID_ON_FIRE} fill={DS_DAYLIGHT.color.accent} />
            <Path d={FLAME_INNER_ON_FIRE} fill={p.inner} />
            {p.hotspot ? (
              <Circle cx={24} cy={36} r={4.5} fill={p.hotspot} />
            ) : null}
            {p.center ? <Circle cx={24} cy={37} r={2} fill={p.center} /> : null}
          </>
        ) : state === 'locked' ? (
          <>
            <Path
              d={FLAME_OUTER_LOCKED}
              fill={p.outer}
              stroke={p.outerStroke}
              strokeWidth={1.5}
            />
            <Path d={FLAME_INNER_LOCKED} fill={p.inner} />
            {p.hotspot ? (
              <Circle cx={24} cy={34} r={4} fill={p.hotspot} />
            ) : null}
          </>
        ) : (
          <>
            <Path
              d={FLAME_OUTER_BASE}
              fill={p.outer}
              fillOpacity={state === 'frozen' ? 0.85 : 1}
              stroke={p.outerStroke}
              strokeWidth={1.5}
            />
            <Path
              d={FLAME_INNER_BASE}
              fill={p.inner}
              fillOpacity={state === 'frozen' ? 0.7 : 1}
            />
          </>
        )}

        {state === 'frozen' ? (
          <>
            <Line
              x1={24}
              y1={12}
              x2={24}
              y2={26}
              stroke={DS_DAYLIGHT.color.inkMuted2}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <Line
              x1={17}
              y1={19}
              x2={31}
              y2={19}
              stroke={DS_DAYLIGHT.color.inkMuted2}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <Line
              x1={19}
              y1={14}
              x2={29}
              y2={24}
              stroke={DS_DAYLIGHT.color.inkMuted2}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <Line
              x1={29}
              y1={14}
              x2={19}
              y2={24}
              stroke={DS_DAYLIGHT.color.inkMuted2}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}


const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
