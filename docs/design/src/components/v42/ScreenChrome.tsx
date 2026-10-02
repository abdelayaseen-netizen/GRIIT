import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// G1. One rule for every screen: a solid canvas band the height of the top safe area,
// drawn above the scroll view. No blur: blur over ink lets content ghost through the clock.
export function ScreenChrome({ children }: { children: React.ReactNode }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <View style={{ flex: 1, marginTop: top }}>{children}</View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: top, backgroundColor: color.canvas, zIndex: 10 }} />
    </View>
  );
}
