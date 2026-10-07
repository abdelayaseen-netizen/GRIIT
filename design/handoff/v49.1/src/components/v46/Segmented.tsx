import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colorV46 as c } from '../../tokens.v46';

// D2. Selected = inverted (text-primary fill, ink text). Never orange. 32pt tall, 44pt hit via hitSlop.
export function Segmented<T extends string>({ items, value, onChange }: { items: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', padding: 2, gap: 2, borderRadius: 999, backgroundColor: c.surface, alignSelf: 'flex-start' }}>
      {items.map(it => {
        const on = it === value;
        return (
          <Pressable key={it} onPress={() => onChange(it)} hitSlop={{ top: 6, bottom: 6 }} accessibilityState={{ selected: on }}
            style={{ height: 28, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center', backgroundColor: on ? c.selectedBg : 'transparent' }}>
            <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: on ? '600' : '500', color: on ? c.selectedText : c.textSecondary }}>{it}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={5} style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: selected ? c.selectedBg : c.surface }}>
      <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: selected ? '600' : '500', color: selected ? c.selectedText : c.textPrimary }}>{label}</Text>
    </Pressable>
  );
}
