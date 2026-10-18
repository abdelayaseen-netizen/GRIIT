import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { GlassView } from 'expo-glass-effect'; // iOS 26 UIGlassEffect. Verify the package version against the Expo SDK in use.
import { GLASS, GLASS_FALLBACK } from './tokens';
import { useGlassEnabled } from './useGlass';

type Kind = keyof typeof GLASS;
export function GlassSurface({ kind = 'chrome', style, children, ...rest }: ViewProps & { kind?: Kind }) {
  const on = useGlassEnabled();
  if (!on) return <View style={[styles.fallback, style]} {...rest}>{children}</View>;
  return (
    <GlassView glassEffectStyle="regular" tintColor={GLASS[kind].tint} style={style} {...rest}>
      {children}
    </GlassView>
  );
}
const styles = StyleSheet.create({
  fallback: { backgroundColor: GLASS_FALLBACK.fill, borderWidth: GLASS_FALLBACK.hairlineWidth, borderColor: GLASS_FALLBACK.hairline },
});
