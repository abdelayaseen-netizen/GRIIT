import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Flame } from 'lucide-react-native';
import { Avatar } from './Avatar';

export function compact(n: number) { return n < 10000 ? n.toLocaleString('en-US') : (Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'K'; }

// Frame 130. streak and secured are earned: hero face. followers / following are social: 500.
export function ProfileHeader(p: { userId: string; avatarUrl?: string | null; displayName: string; username: string; bio?: string | null; streakDays: number; securedDays: number; followers: number; following: number; isOwner: boolean; isFollowing?: boolean; onEdit: () => void; onFollow: () => void; onShare: () => void; onEditBio: () => void }) {
  const Stat = ({ n, l, earned, flame }: any) => (
    <View style={{ flex: 1, alignItems: 'center', gap: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        {flame ? <Flame size={16} color={color.brand} /> : null}
        <Text style={{ fontSize: 17, lineHeight: 22, color: color.textPrimary, fontVariant: ['tabular-nums'], ...(earned ? { fontFamily: displayFace, fontWeight: displayWeight } : { fontWeight: '500' }) }}>{compact(n)}</Text>
      </View>
      <Text numberOfLines={1} style={{ ...type.caption, color: color.textSecondary }}>{l}</Text>
    </View>
  );
  const Btn = ({ label, primary, onPress }: any) => (
    <Pressable onPress={onPress} hitSlop={4} style={{ flex: 1, height: 36, borderRadius: radius.input, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? color.primary : color.surface, borderWidth: primary ? 0 : 1, borderColor: color.border }}>
      <Text style={{ ...type.secondary, fontWeight: '500', color: color.textPrimary }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar userId={p.userId} uri={p.avatarUrl} displayName={p.displayName} username={p.username} size={80} />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Stat n={p.streakDays} l="streak" earned flame />
          <Stat n={p.securedDays} l="secured" earned />
          <Stat n={p.followers} l="followers" />
          <Stat n={p.following} l="following" />
        </View>
      </View>
      <View style={{ paddingTop: 10, gap: 1 }}>
        <Text style={{ ...type.bodyStrong, color: color.textPrimary }}>{p.displayName}</Text>
        <Text style={{ ...type.secondary, color: color.textSecondary }}>@{p.username}</Text>
        {p.bio ? <Text style={{ ...type.secondary, color: color.textPrimary, paddingTop: 4 }}>{p.bio}</Text>
          : p.isOwner ? <Text onPress={p.onEditBio} style={{ ...type.secondary, color: color.textSecondary, paddingTop: 4 }}>Add a bio</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 12 }}>
        {p.isOwner ? <Btn label="Edit profile" onPress={p.onEdit} /> : <Btn label={p.isFollowing ? 'Following' : 'Follow'} primary={!p.isFollowing} onPress={p.onFollow} />}
        <Btn label="Share profile" onPress={p.onShare} />
      </View>
    </View>
  );
}
