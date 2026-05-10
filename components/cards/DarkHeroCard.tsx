import React from 'react';
import { View, ViewStyle } from 'react-native';
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';

/**
 * The signature dark surface container for GRIIT v2.
 *
 * Spec: docs/design/DESIGN_SYSTEM_v2.md Part 7.1 (Cards) and Part 10.1 (Home).
 *
 * Pure presentational wrapper — no state, no streak-state logic. Children
 * decide what to render; this component decides how the surface looks.
 *
 * Surface variants:
 * - 'heroDark' (default, DS_COLORS_V2.surface.heroDark) — streak hero,
 *   trophies, primary CTAs (Duolingo +60% retention lever per spec Part 1).
 * - 'heroDarkWarm' (DS_COLORS_V2.surface.heroDarkWarm) — secondary effort
 *   surface, used for the Day 0 / streak-lost comeback state and active
 *   task in-flight rows.
 *
 * Border defaults to none; render the at-risk red border by passing
 * borderWidth={1.5} and borderColor={DS_COLORS_V2.semantic.dangerOnDark}.
 */
type SurfaceVariant = 'heroDark' | 'heroDarkWarm';

type Props = {
  children: React.ReactNode;
  surfaceVariant?: SurfaceVariant;
  padding?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
};

function resolveBackground(variant: SurfaceVariant): string {
  return variant === 'heroDarkWarm'
    ? DS_COLORS_V2.surface.heroDarkWarm
    : DS_COLORS_V2.surface.heroDark;
}

export default function DarkHeroCard({
  children,
  surfaceVariant = 'heroDark',
  padding = DS_SPACING_V2.lg,
  borderColor,
  borderWidth = 0,
  style,
}: Props) {
  const baseStyle: ViewStyle = {
    backgroundColor: resolveBackground(surfaceVariant),
    borderRadius: DS_RADIUS_V2.xl,
    padding,
  };

  const borderStyle: ViewStyle =
    borderWidth > 0
      ? { borderWidth, borderColor: borderColor ?? 'transparent' }
      : {};

  return <View style={[baseStyle, borderStyle, style]}>{children}</View>;
}
