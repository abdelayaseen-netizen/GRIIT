// v48 batch 2: Profile → Proofs grid → vertical day feed with per-day carousels (founder direction 2).
import React, { useState } from 'react';
import { View, Text, Pressable, Image, FlatList, Dimensions } from 'react-native';
import { Lock, Users, Copy, Plus } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';
import { CameraSeal } from './FeedPost';

const W = Dimensions.get('window').width, H = Math.round(W * 1.25);
export type Proof = { id: string; photoUri?: string; task: string; challenge: string; dayLine: string; gate: 'Camera' | 'Self-reported' | 'Location'; time: string; shared: boolean; uploadFailed?: boolean };
export type ProofDay = { dateKey: string; label: string; proofs: Proof[] };

// Grid tile: 4:5, Today first (dashed, open), self-reported tiles show the task name honestly, lock on private, stack icon on multi-proof days.
export function ProofTile({ day, onPress }: { day: ProofDay | 'today'; onPress: () => void }) {
  if (day === 'today') return <Pressable onPress={onPress} style={{ flex: 1, aspectRatio: 0.8, borderWidth: 1.5, borderColor: c.textTertiary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Plus size={18} color={c.textSecondary} /><Text style={{ ...t.caption, color: c.textSecondary }}>Today</Text></Pressable>;
  const p = day.proofs[0];
  return (
    <Pressable onPress={onPress} style={{ flex: 1, aspectRatio: 0.8, backgroundColor: p.photoUri ? c.raised : c.surface, overflow: 'hidden' }}>
      {p.photoUri ? <Image source={{ uri: p.photoUri }} style={{ width: '100%', height: '100%' }} /> :
        <View style={{ flex: 1, justifyContent: 'center', padding: 8, gap: 2 }}><Text style={{ ...t.caption, color: c.textPrimary }}>{p.task}</Text><Text style={{ ...t.caption, color: c.textSecondary }}>Self-reported</Text></View>}
      <Text style={{ position: 'absolute', left: 6, bottom: 5, fontSize: 11, fontWeight: '500', color: c.textPrimary }}>{day.label}</Text>
      {day.proofs.length > 1 ? <View style={{ position: 'absolute', right: 6, top: 6 }}><Copy size={14} color={c.textPrimary} /></View>
        : !p.shared ? <View style={{ position: 'absolute', right: 6, top: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(15,15,15,0.7)', alignItems: 'center', justifyContent: 'center' }}><Lock size={11} color={c.textPrimary} /></View> : null}
    </Pressable>
  );
}

// One day in the vertical feed. Owner sees Shared/Private and "Share this proof" on private ones; visitors get shared proofs only (filter server-side, drop empty days).
export function ProofDayBlock({ day, owner, onShare }: { day: ProofDay; owner: boolean; onShare: (p: Proof) => void }) {
  const [i, setI] = useState(0); const p = day.proofs[i];
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ ...t.headline, color: c.textPrimary }}>{day.label}</Text>
        <Text style={{ ...t.secondary, color: c.textSecondary }}>{day.proofs.length === 1 ? '1 proof' : `${day.proofs.length} proofs`}</Text>
      </View>
      <View style={{ width: W, height: H }}>
        <FlatList horizontal pagingEnabled data={day.proofs} keyExtractor={x => x.id} showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
          renderItem={({ item }) => item.photoUri && !item.uploadFailed ? <Image source={{ uri: item.photoUri }} style={{ width: W, height: H }} /> :
            <View style={{ width: W, height: H, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', gap: 6 }}><Text style={{ ...t.headline, color: c.textPrimary }}>{item.task}</Text><Text style={{ ...t.secondary, color: c.textSecondary }}>{item.uploadFailed ? 'The photo didn’t upload. The task still counts.' : 'Self-reported'}</Text></View>} />
        {p.photoUri && !p.uploadFailed ? <View style={{ position: 'absolute', left: 12, top: 12 }}><CameraSeal /></View> : null}
        {day.proofs.length > 1 ? <View style={{ position: 'absolute', right: 12, top: 12, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: 'rgba(15,15,15,0.62)', justifyContent: 'center' }}><Text style={{ ...t.caption, color: c.textPrimary }}>{i + 1} of {day.proofs.length}</Text></View> : null}
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 2 }}>
        <Text style={{ ...t.headline, color: c.textPrimary }}>{p.task}</Text>
        <Text style={{ ...t.secondary, color: c.textSecondary }}>{p.challenge} · {p.dayLine} · {p.gate} · {p.time}</Text>
        {owner ? <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{p.shared ? <Users size={14} color={c.textSecondary} /> : <Lock size={14} color={c.textSecondary} />}<Text style={{ ...t.secondary, color: c.textSecondary }}>{p.shared ? 'Shared to the feed' : 'Private'}</Text></View>
          <Pressable onPress={() => onShare(p)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ ...t.headline, color: c.textPrimary }}>{p.shared ? 'Share' : 'Share this proof'}</Text></Pressable>
        </View> : null}
      </View>
    </View>
  );
}
