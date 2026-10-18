import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, AlertCircle } from 'lucide-react-native';
import { DS_V3 } from '@/ds';
import { GlassSurface } from './GlassSurface';
import { GLASS_INSET, GLASS_RADIUS, GLASS_STATE } from './tokens';

export function GlassToast({ message, error, action, onAction, aboveTabBar = true }: { message: string; error?: boolean; action?: string; onAction?: () => void; aboveTabBar?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inset = width <= 375 ? GLASS_INSET.se : GLASS_INSET.regular;
  useEffect(() => { AccessibilityInfo.announceForAccessibility(message); }, [message]);
  const Icon = error ? AlertCircle : CircleCheck;
  return (
    <GlassSurface kind="chrome" accessibilityRole="alert" style={[styles.toast, { left: inset, right: inset, bottom: Math.max(insets.bottom - 10, 8) + (aboveTabBar ? 70 : 0) }]}>
      <Icon size={20} color={DS_V3.color.textPrimary} />
      <Text style={[DS_V3.type.secondary, styles.msg]}>{message}</Text>
      {action ? <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={action} style={styles.btn}><Text style={DS_V3.type.secondaryStrong}>{action}</Text></Pressable> : null}
    </GlassSurface>
  );
}
const styles = StyleSheet.create({
  toast: { position: 'absolute', minHeight: 52, borderRadius: GLASS_RADIUS.toast, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 16, paddingRight: 8, overflow: 'hidden' },
  msg: { flex: 1, paddingVertical: 6 },
  btn: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
});
// Duration 4 s; swipe down dismisses. A "Share" action always opens the sticker carousel (Part 1.3): onAction={() => router.push('/share/stickers')}. Errors state the real reason and only offer Retry when a retry can work.
