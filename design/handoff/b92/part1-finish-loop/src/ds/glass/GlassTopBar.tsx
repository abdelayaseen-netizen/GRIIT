import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { DS_V3 } from '@/ds';
import { GlassSurface } from './GlassSurface';

// Transparent at rest; glass fades in over the first 8 pt of scroll. Title is never a route name.
export function GlassTopBar({ title, subtitle, scrollY, onBack, onMore }: { title: string; subtitle?: string; scrollY: Animated.Value; onBack: () => void; onMore?: () => void }) {
  const insets = useSafeAreaInsets();
  const opacity = scrollY.interpolate({ inputRange: [0, 8], outputRange: [0, 1], extrapolate: 'clamp' });
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}><GlassSurface kind="thin" style={StyleSheet.absoluteFill} /></Animated.View>
      <View style={styles.row}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={0} style={styles.btn}><ChevronLeft size={24} color={DS_V3.color.textPrimary} /></Pressable>
        <View style={styles.mid}>
          <Text numberOfLines={1} style={[DS_V3.type.bodyStrong, styles.title]} accessibilityRole="header">{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={DS_V3.type.caption}>{subtitle}</Text> : null}
        </View>
        {onMore ? <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel="More" style={styles.btn}><MoreHorizontal size={22} color={DS_V3.color.textPrimary} /></Pressable> : <View style={styles.btn} />}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20 },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1, minWidth: 0, alignItems: 'center' },
  title: { fontWeight: '500' },
});
