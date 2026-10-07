import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colorV46 as c, typeV46 as t, componentV46 as k } from '../../tokens.v46';

// D3. Every tab: Title L left, up to two 36pt icon buttons right, 16pt gutter.
export function ScreenHeader({ title, overline, actions = [] }: { title: string; overline?: string; actions?: { icon: React.ReactNode; label: string; onPress: () => void }[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: k.gutter, paddingTop: 8, minHeight: 44, gap: 8 }}>
      <View style={{ flex: 1, gap: 2 }}>
        {overline ? <Text style={{ ...t.label, color: c.textSecondary }}>{overline}</Text> : null}
        <Text numberOfLines={1} style={{ ...t.titleL, color: c.textPrimary }}>{title}</Text>
      </View>
      {actions.slice(0, 2).map(a => (
        <Pressable key={a.label} onPress={a.onPress} hitSlop={4} accessibilityLabel={a.label}
          style={{ width: k.headerIconButton, height: k.headerIconButton, borderRadius: 18, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>{a.icon}</Pressable>
      ))}
    </View>
  );
}

// Profile: the handle at Title size in the nav bar, truncated.
export function HandleNavBar({ handle, right }: { handle: string; right: React.ReactNode }) {
  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: k.gutter, gap: 10 }}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, ...t.title, color: c.textPrimary }}>@{handle}</Text>
      {right}
    </View>
  );
}
