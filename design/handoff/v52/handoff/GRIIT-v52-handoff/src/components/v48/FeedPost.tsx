// v48 founder direction 3: Instagram-feel feed. Full-bleed 4:5 photo posts; multi-photo days are a
// horizontal carousel with an "i of k" pill; self-reported posts and activity lines stay compact.
import React, { useState } from 'react';
import { View, Text, Pressable, Image, FlatList, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share, MoreHorizontal, Camera } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';
import { Avatar } from '../v46/Avatar';

const W = Dimensions.get('window').width, H = Math.round(W * 1.25);
export const CameraSeal = () => (
  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,15,15,0.45)', borderWidth: 1, borderColor: 'rgba(242,240,235,0.55)', alignItems: 'center', justifyContent: 'center' }}><Camera size={14} color={c.textPrimary} /></View>
);

export function PhotoPost(p: { userId: string; name: string; sub: string; time: string; photos: { uri: string; caption?: string }[]; respects: number; comments: number; onRespect: () => void; onComments: () => void; onShare: () => void; onMore: () => void }) {
  const [i, setI] = useState(0);
  const cap = p.photos[i]?.caption;
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 6, paddingVertical: 10 }}>
        <Avatar userId={p.userId} name={p.name} size={32} />
        <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ ...t.headline, color: c.textPrimary }}>{p.name}</Text><Text style={{ ...t.secondary, color: c.textSecondary }}>{p.sub}</Text></View>
        <Text style={{ ...t.caption, color: c.textSecondary }}>{p.time}</Text>
        <Pressable onPress={p.onMore} hitSlop={4} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><MoreHorizontal size={20} color={c.textSecondary} /></Pressable>
      </View>
      <View style={{ width: W, height: H }}>
        <FlatList horizontal pagingEnabled data={p.photos} keyExtractor={(_, k) => String(k)} showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
          renderItem={({ item }) => <Pressable onPress={() => {}} delayLongPress={250}><Image source={{ uri: item.uri }} style={{ width: W, height: H }} /></Pressable>} />
        <View style={{ position: 'absolute', left: 12, top: 12 }}><CameraSeal /></View>
        {p.photos.length > 1 ? <View style={{ position: 'absolute', right: 12, top: 12, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: 'rgba(15,15,15,0.62)', justifyContent: 'center' }}><Text style={{ ...t.caption, color: c.textPrimary }}>{i + 1} of {p.photos.length}</Text></View> : null}
        {cap ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 44, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: 'rgba(15,15,15,0.8)' }}><Text style={{ ...t.body, color: c.textPrimary }}>{cap}</Text></View> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Act onPress={p.onRespect} icon={<Heart size={24} color={c.textPrimary} />} n={p.respects} />
        <Act onPress={p.onComments} icon={<MessageCircle size={24} color={c.textPrimary} />} n={p.comments} />
        <View style={{ flex: 1 }} />
        <Act onPress={p.onShare} icon={<Share size={24} color={c.textPrimary} />} n={0} />
      </View>
    </View>
  );
}
const Act = ({ onPress, icon, n }: { onPress: () => void; icon: React.ReactNode; n: number }) => (
  <Pressable onPress={onPress} style={{ minWidth: 44, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }}>{icon}{n > 0 ? <Text style={{ ...t.caption, color: c.textPrimary }}>{n}</Text> : null}</Pressable>
);

// Grouping rule (server or client): consecutive "started"/"finished" events for the same challenge merge;
// at most one activity group per 4 posts; max 3 avatars; text "A, B and n others started X".
export function groupActivity<T extends { kind: 'post' | 'activity'; challengeId?: string; verb?: string }>(items: T[], every = 4): (T | { kind: 'group'; members: T[] })[] {
  const out: any[] = []; let sinceGroup = every;
  for (const it of items) {
    if (it.kind !== 'activity') { out.push(it); sinceGroup++; continue; }
    const last = out[out.length - 1];
    if (last?.kind === 'group' && last.members[0].challengeId === it.challengeId && last.members[0].verb === it.verb) { last.members.push(it); continue; }
    if (sinceGroup < every) continue;               // capped: dropped from Home, still in Activity
    out.push({ kind: 'group', members: [it] }); sinceGroup = 0;
  }
  return out;
}
