/**
 * StreakRingAvatar — circular avatar wrapped in a streak progress ring.
 *
 * The ring fills clockwise from 12 o'clock proportional to `streak / maxRingDays`
 * (clamped 0-1). React Native has no `conic-gradient` primitive, so we use
 * `react-native-svg` and rotate the partially-stroked circle so the dash
 * starts at the top.
 *
 * Optional camera badge (24×24 white circle, lucide `Camera`) renders on the
 * bottom-right when `showCameraBadge` is set — used by the self profile to
 * indicate the avatar is uploadable.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Camera } from 'lucide-react-native';

import { Avatar } from '@/components/Avatar';
import { DS_COLORS_V2 } from '@/lib/design-system';

export type StreakRingAvatarProps = {
  url?: string | null;
  name: string;
  userId?: string;
  size: number;
  /** Current streak in days. Drives the ring fill. */
  streak: number;
  /** Streak count that fills the ring 100%. Defaults to 30 (one full month). */
  maxRingDays?: number;
  /** Render a small white circle with a camera glyph in the bottom-right. */
  showCameraBadge?: boolean;
  /** Make the whole avatar tappable. */
  onPress?: () => void;
  accessibilityLabel?: string;
};

const RING_TRACK_COLOR = DS_COLORS_V2.surface.divider;
const RING_FILL_COLOR = DS_COLORS_V2.brand.primary;
const BADGE_BG = DS_COLORS_V2.surface.card;
const BADGE_ICON = DS_COLORS_V2.text.primary;

export const StreakRingAvatar = React.memo(function StreakRingAvatar({
  url,
  name,
  userId,
  size,
  streak,
  maxRingDays = 30,
  showCameraBadge = false,
  onPress,
  accessibilityLabel,
}: StreakRingAvatarProps) {
  const stroke = size <= 48 ? 3 : 4;
  const outerSize = size + stroke * 2;
  const radius = outerSize / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, streak / Math.max(1, maxRingDays)));
  const dashOffset = circumference * (1 - ratio);

  const a11yLabel =
    accessibilityLabel ??
    `Avatar for ${name}${streak > 0 ? `, ${streak} day streak` : ''}`;
  const badgeSize = Math.max(20, Math.round(size * 0.28));

  const inner = (
    <View
      style={[
        styles.outer,
        { width: outerSize, height: outerSize },
      ]}
    >
      <Svg
        width={outerSize}
        height={outerSize}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={radius}
          stroke={RING_TRACK_COLOR}
          strokeWidth={stroke}
          fill="transparent"
        />
        {ratio > 0 ? (
          <Circle
            cx={outerSize / 2}
            cy={outerSize / 2}
            r={radius}
            stroke={RING_FILL_COLOR}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${outerSize / 2} ${outerSize / 2})`}
          />
        ) : null}
      </Svg>
      <View
        style={[
          styles.avatarWrap,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: stroke,
            left: stroke,
          },
        ]}
      >
        <Avatar url={url} name={name} size={size} userId={userId} />
      </View>
      {showCameraBadge ? (
        <View
          style={[
            styles.cameraBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <Camera
            size={Math.max(11, Math.round(badgeSize * 0.55))}
            color={BADGE_ICON}
            strokeWidth={2}
          />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        hitSlop={8}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <View accessibilityRole="image" accessibilityLabel={a11yLabel}>
      {inner}
    </View>
  );
});

export default StreakRingAvatar;

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  avatarWrap: {
    position: 'absolute',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: BADGE_BG,
    borderWidth: 2,
    borderColor: DS_COLORS_V2.surface.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
