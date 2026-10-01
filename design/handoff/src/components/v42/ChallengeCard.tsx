import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Avatar } from './Avatar';

// Frame 131. One segment per day of the run. Shapes differ as well as colours:
// secured solid brand, held (freeze / Last Stand) solid grey, missed hollow, today brand outline, future dim.
export type Seg = 'secured' | 'held' | 'missed' | 'today' | 'future';
// Never one segment per day for runs over 14: the strip shows the last 14 days (up to today),
// and the label carries the whole run. due counts today only once it is secured.
export const STRIP_MAX = 14;
export function ProgressStrip({ days, secured, due }: { days: Seg[]; secured?: number; due?: number }) {
  const upToToday = days.slice(0, Math.max(days.findIndex(d => d === 'future'), 0) || days.length);
  const shown = days.length <= STRIP_MAX ? days : upToToday.slice(-STRIP_MAX);
  const label = secured != null && due ? secured + ' of ' + due + (due === 1 ? ' day' : ' days') : null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel={label ? label + ' secured' : undefined}>
    <View style={{ flex: 1, flexDirection: 'row', gap: 3, height: 8 }}>
      {shown.map((d, i) => (
        <View key={i} style={{ flex: 1, borderRadius: 2,
          backgroundColor: d === 'secured' ? color.brand : d === 'held' ? color.textSecondary : d === 'future' ? color.border : 'transparent',
          borderWidth: d === 'missed' ? 1 : d === 'today' ? 1.5 : 0, borderColor: d === 'today' ? color.brand : color.textSecondary }} />
      ))}
    </View>
    {label ? <Text style={{ ...type.caption, color: color.textSecondary }}>{label}</Text> : null}
    </View>
  );
}
export type ChallengeCardProps = {
  title: string;
  status: 'active' | 'completed' | 'abandoned' | 'failed';   // active_challenges.status
  line: string;          // built by challengeLine()
  todayChip?: string;    // "Secured today" | "{n} tasks left" | "Starts tomorrow"; active only
  days: Seg[];
  secured?: number;      // running only: count of day_secures in this run
  due?: number;          // running only: due days so far; today counts once secured
  members?: { userId: string; displayName: string; avatarUrl?: string | null }[];  // group only
  memberCount?: number;
  onPress: () => void;
};
export function challengeLine(c: { status: string; dayN: number; durationDays: number; secured: number; range: string; startsTomorrow?: boolean; startDate?: string }) {
  if (c.startsTomorrow) return 'Day 1 is ' + c.startDate + ' · ' + c.range;
  if (c.status === 'active') return 'Day ' + c.dayN + ' of ' + c.durationDays + ' · ' + c.range;
  if (c.status === 'completed') return 'Finished · ' + c.secured + ' of ' + c.durationDays + (c.durationDays === 1 ? ' day' : ' days') + ' · ' + c.range;
  if (c.status === 'failed') return 'Ended on day ' + c.dayN + ' · ' + c.range;
  return 'Left on day ' + c.dayN + ' · ' + c.range;
}
export function ChallengeCard(p: ChallengeCardProps) {
  return (
    <Pressable onPress={p.onPress} style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, borderRadius: radius.card, padding: 14, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, ...type.bodyStrong, color: color.textPrimary }} numberOfLines={1}>{p.title}</Text>
        {p.todayChip ? <View style={{ height: 24, paddingHorizontal: 9, borderRadius: 999, backgroundColor: color.brandTint, justifyContent: 'center' }}><Text style={{ ...type.caption, fontWeight: '500', color: color.brandText }}>{p.todayChip}</Text></View> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, ...type.caption, color: color.textSecondary }}>{p.line}</Text>
        {p.members?.length ? (
          <>
            <View style={{ flexDirection: 'row' }}>{p.members.slice(0, 3).map((m, i) => <View key={m.userId} style={{ marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: color.surface, borderRadius: 999 }}><Avatar userId={m.userId} uri={m.avatarUrl} displayName={m.displayName} size={24} /></View>)}</View>
            <Text style={{ ...type.caption, color: color.textPrimary }}>{p.memberCount} of 10</Text>
          </>
        ) : null}
      </View>
      <ProgressStrip days={p.days} secured={p.status === 'active' ? p.secured : undefined} due={p.status === 'active' ? p.due : undefined} />
    </Pressable>
  );
}
