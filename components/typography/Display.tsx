import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { DS_TYPE, DS_COLORS_V2 } from '@/lib/design-system';

/**
 * 64pt streak hero number — single-purpose, dark-surface-only.
 * Spec: docs/design/DESIGN_SYSTEM_v2.md Part 6.
 *
 * Default fontSize comes from DS_TYPE.display (64pt). For 4-digit (1000+)
 * streaks pass style={{ fontSize: 56 }}; for 5-digit (10000+) pass
 * style={{ fontSize: 48 }}. See StreakHeroV2.getStreakFontSize().
 *
 * Always renders DS_COLORS_V2.text.onDark — never used on light surfaces.
 */
type Props = {
  children: React.ReactNode;
  style?: TextStyle;
} & Omit<TextProps, 'style' | 'children'>;

export default function Display({ children, style, ...rest }: Props) {
  return (
    <Text
      style={[
        DS_TYPE.display,
        { color: DS_COLORS_V2.text.onDark },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
