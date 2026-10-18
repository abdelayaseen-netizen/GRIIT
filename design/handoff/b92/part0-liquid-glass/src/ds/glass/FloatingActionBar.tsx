import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ds'; // DS_V3 Button: primary is solid brand fill, never glass
import { GlassSurface } from './GlassSurface';
import { GLASS_INSET, GLASS_RADIUS } from './tokens';

export function FloatingActionBar({ primary, onPrimary, secondary, onSecondary, disabled, loading }: { primary: string; onPrimary: () => void; secondary?: string; onSecondary?: () => void; disabled?: boolean; loading?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inset = width <= 375 ? GLASS_INSET.se : GLASS_INSET.regular;
  return (
    <GlassSurface kind="chrome" style={[styles.bar, { left: inset, right: inset, bottom: Math.max(insets.bottom - 10, 8) }]}>
      {secondary ? <Button variant="glass" onPress={onSecondary} style={styles.flex} accessibilityLabel={secondary}>{secondary}</Button> : null}
      <Button variant="primary" onPress={onPrimary} disabled={disabled || loading} loading={loading} style={styles.flex} accessibilityLabel={primary}>{loading ? 'Posting' : primary}</Button>
    </GlassSurface>
  );
}
const styles = StyleSheet.create({
  bar: { position: 'absolute', flexDirection: 'row', gap: 8, padding: 7, borderRadius: GLASS_RADIUS.actionBar, overflow: 'hidden' },
  flex: { flex: 1, minHeight: 50 },
});
// Lists under the bar get contentInset bottom 90.
