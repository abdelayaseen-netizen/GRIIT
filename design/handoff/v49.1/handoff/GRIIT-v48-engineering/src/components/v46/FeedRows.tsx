import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Heart, MessageCircle, Camera, Check } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';
import { Avatar } from './Avatar';

// F2.2 Self-reported: one compact row, actions inline. Counts hidden at 0.
export function SelfReportedRow(p: { userId: string; name: string; task: string; meta: string; ago: string; respects: number; comments: number; respected: boolean; onRespect: () => void; onComments: () => void; onProfile: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, minHeight: 56 }}>
      <Pressable onPress={p.onProfile}><Avatar userId={p.userId} displayName={p.name} size={32} /></Pressable>
      <View style={{ flex: 1, gap: 1 }}>
        <Text numberOfLines={1}><Text style={{ ...t.headline, color: c.textPrimary }}>{p.name}</Text><Text style={{ ...t.secondary, color: c.textTertiary }}> · </Text><Text style={{ ...t.body, color: c.textPrimary }}>{p.task}</Text></Text>
        <Text style={{ ...t.secondary, color: c.textSecondary }}>{p.meta} · {p.ago}</Text>
      </View>
      <Pressable onPress={p.onRespect} style={{ minWidth: 40, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Heart size={18} color={p.respected ? c.textPrimary : c.textSecondary} fill={p.respected ? c.textPrimary : 'transparent'} />
        {p.respects ? <Text style={{ ...t.caption, color: c.textSecondary }}>{p.respects}</Text> : null}
      </Pressable>
      <Pressable onPress={p.onComments} style={{ minWidth: 40, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <MessageCircle size={18} color={c.textSecondary} />
        {p.comments ? <Text style={{ ...t.caption, color: c.textSecondary }}>{p.comments}</Text> : null}
      </Pressable>
    </View>
  );
}

// F2.3 Activity line, grouped per user per day.
export function activityText(name: string, verb: 'started' | 'finished', titles: string[]) {
  return titles.length === 1 ? name + ' ' + verb + ' ' + titles[0] : name + ' ' + verb + ' ' + titles.length + ' challenges';
}

// F2 broken or forbidden image: a designed tile, never a black box.
export function ProofImageFallback({ task }: { task: string }) {
  return (
    <View style={{ width: '100%', aspectRatio: 4 / 5, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.hairline, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Camera size={28} color={c.textSecondary} />
      <Text style={{ ...t.headline, color: c.textPrimary }}>{task}</Text>
      <Text style={{ ...t.secondary, color: c.textSecondary }}>Photo can't be shown</Text>
    </View>
  );
}

// The done check: the only orange inside a task row.
export function DoneCircle() {
  return <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.raised, borderWidth: 1.5, borderColor: c.hairline, alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={c.brand} strokeWidth={3} /></View>;
}
