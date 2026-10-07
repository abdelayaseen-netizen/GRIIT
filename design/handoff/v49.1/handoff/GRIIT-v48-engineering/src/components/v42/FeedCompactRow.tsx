import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Heart, MessageCircle, Users } from 'lucide-react-native';
import { Avatar } from './Avatar';

// Frame 127. Self-reported and text completions. Under a third of a photo post's height.
// The challenge name appears once, in the last line, with the gate label.
export function FeedCompactRow(p: { userId: string; displayName: string; username: string; avatarUrl?: string | null; ago: string; task: string; dayN: number; dayOf: number; challenge: string; gateLine: string; respects: number; respected: boolean; comments: number; onProfile: () => void; onChallenge: () => void; onRespect: () => void; onComments: () => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12 }}>
      <Pressable onPress={p.onProfile} hitSlop={6}><Avatar userId={p.userId} uri={p.avatarUrl} displayName={p.displayName} username={p.username} size={32} /></Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text onPress={p.onProfile} style={{ fontSize: 14, lineHeight: 18, fontWeight: '500', color: color.textPrimary }}>{p.displayName}</Text>
          <Text style={{ ...type.caption, color: color.textSecondary }}>{p.ago}</Text>
        </View>
        <Text style={{ fontSize: 14, lineHeight: 19, color: color.textPrimary }}>completed {p.task} · Day {p.dayN} of {p.dayOf}</Text>
        <Text onPress={p.onChallenge} style={{ ...type.caption, color: color.textSecondary }}>{p.challenge} · {p.gateLine}</Text>
        <View style={{ flexDirection: 'row', gap: 18, marginTop: 4 }}>
          <Pressable onPress={p.onRespect} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32 }}>
            <Heart size={18} color={p.respected ? color.brand : color.textSecondary} fill={p.respected ? color.brand : 'transparent'} />
            <Text style={{ ...type.caption, fontWeight: '500', color: p.respected ? color.brandText : color.textSecondary }}>{p.respects}</Text>
          </Pressable>
          <Pressable onPress={p.onComments} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MessageCircle size={18} color={color.textSecondary} />
            <Text style={{ ...type.caption, fontWeight: '500', color: color.textSecondary }}>{p.comments}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// Join events: one line. Guests (is_guest / no username) are filtered server-side and never counted.
export function joinLine(names: string[], others: number, challenge: string) {
  const who = names.length === 1 && !others ? names[0] : others ? names.join(', ') + ' and ' + others + (others === 1 ? ' other' : ' others') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  return who + ' started ' + challenge;
}
export function FeedJoinLine({ text, ago }: { text: string; ago: string }) {
  return (
    <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }}>
      <Users size={18} color={color.textSecondary} />
      <Text numberOfLines={2} style={{ flex: 1, ...type.secondary, color: color.textPrimary }}>{text}</Text>
      <Text style={{ ...type.caption, color: color.textSecondary }}>{ago}</Text>
    </View>
  );
}

// System lines (day secured, challenge finished): same 32pt avatar as every other row.
export function FeedSystemLine(p: { userId: string; displayName: string; username: string; avatarUrl?: string | null; text: string; ago: string; onProfile: () => void }) {
  return (
    <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 6 }}>
      <Pressable onPress={p.onProfile} hitSlop={6}><Avatar userId={p.userId} uri={p.avatarUrl} displayName={p.displayName} username={p.username} size={32} /></Pressable>
      <Text numberOfLines={2} style={{ flex: 1, ...type.secondary, color: color.textPrimary }}>{p.text}</Text>
      <Text style={{ ...type.caption, color: color.textSecondary }}>{p.ago}</Text>
    </View>
  );
}
