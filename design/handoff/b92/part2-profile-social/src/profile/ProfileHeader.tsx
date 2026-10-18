import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar, Button, Flame } from '@/components/ds';
import { DS_V3 } from '@/ds';
import { PROFILE_NUMBERS, followLine, UserStats } from './stats';

// Renders from cache immediately (useQuery initialData from MMKV); numbers refresh in place.
export function ProfileHeader({ user, stats, own, following, onEdit, onFind, onFollow, onInvite, onFollows, onRecord, recordSummary }: any) {
  return (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Avatar uri={user.avatar} size={76} accessibilityLabel={user.name} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={DS_V3.type.title} numberOfLines={2} accessibilityRole="header">{user.name}</Text>
          <Text style={DS_V3.type.secondary} numberOfLines={1}>{user.handle}</Text>
        </View>
      </View>
      {user.bio ? <Text style={DS_V3.type.body}>{user.bio}</Text> : null}
      <View style={{ flexDirection: 'row', borderRadius: 16, backgroundColor: DS_V3.color.surface, paddingVertical: 12 }}>
        {PROFILE_NUMBERS.map((n) => (
          <View key={n.key} style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={`${n.label} ${(stats as any)[n.key]}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>{'flame' in n ? <Flame size={20} lit={stats.current_streak > 0} /> : null}<Text style={DS_V3.type.earnedNumber}>{(stats as any)[n.key]}</Text></View>
            <Text style={DS_V3.type.caption}>{n.label}</Text>
            {'sub' in n ? <Text style={DS_V3.type.captionStrong}>{n.sub(stats as UserStats)}</Text> : null}
          </View>
        ))}
      </View>
      <Pressable onPress={onFollows} accessibilityRole="button" accessibilityLabel={followLine(stats)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={DS_V3.type.secondary}>{followLine(stats)}</Text></Pressable>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {own ? (<><Button variant="secondary" onPress={onEdit} style={{ flex: 1 }}>Edit profile</Button><Button variant="secondary" icon="users" onPress={onFind} style={{ flex: 1 }}>Find friends</Button></>)
             : (<><Button variant={following ? 'secondary' : 'inverse'} onPress={onFollow} style={{ flex: 1 }}>{following ? 'Following' : 'Follow'}</Button><Button variant="secondary" icon="link" onPress={onInvite} style={{ flex: 1 }}>Invite to a challenge</Button></>)}
      </View>
      <Pressable onPress={onRecord} accessibilityRole="button" accessibilityLabel="Challenges, badges and stats" style={{ minHeight: 52, borderRadius: 14, backgroundColor: DS_V3.color.surface, paddingHorizontal: 14, justifyContent: 'center' }}>
        <Text style={DS_V3.type.secondaryStrong}>Challenges, badges and stats</Text><Text style={DS_V3.type.caption}>{recordSummary}</Text>
      </Pressable>
    </View>
  );
}
// Option A (recommended). Option B: drop the record row, add a chart icon to the top bar with the same route.
