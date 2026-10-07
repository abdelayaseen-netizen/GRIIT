import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colorV46 as c, typeV46 as t, numberV46 } from '../../tokens.v46';
import { displayFace, displayWeight } from '../../tokens';
import { Flame, Snowflake } from 'lucide-react-native';

export type WeekDot = 'before' | 'secured' | 'missed' | 'frozen' | 'today' | 'todaySecured' | 'todayLost';

// Status sentence, built from server state only. Never says "secured" until secured_today.
export function statusLine(s: { securedToday: boolean; left: number; total: number; lostTask?: string; stillCountsTask?: string; streakTomorrow: number }) {
  if (s.securedToday) return 'Secured. ' + s.streakTomorrow + ' days in a row.';  // pass today's streak (v47 202)
  if (s.lostTask) return s.lostTask + " closed. Today can't be secured." + (s.stillCountsTask ? ' ' + s.stillCountsTask + ' still counts toward its challenge.' : '');
  return s.left + ' of ' + s.total + ' left today.';
}

export function StreakStrip(p: { streak: number; status: string; week: WeekDot[]; miss?: { keeps: number; freezesLeft: number; onUseFreeze: () => void } }) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: c.surface, borderRadius: 16, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Flame size={26} color={c.brand} fill={c.brand} />
        <Text style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: numberV46.M, lineHeight: 40, color: c.textPrimary, fontVariant: ['tabular-nums'] }}>{p.streak}</Text>
        <Text style={{ ...t.secondary, color: c.textPrimary, marginTop: 10 }}>day streak</Text>
      </View>
      <Text style={{ ...t.body, color: c.textPrimary }}>{p.status}</Text>
      {p.miss ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.hairline }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ ...t.headline, color: c.textPrimary }}>Yesterday wasn't secured</Text>
            <Text style={{ ...t.secondary, color: c.textSecondary }}>A freeze keeps your {p.miss.keeps} days. {p.miss.freezesLeft} left.</Text>
          </View>
          <Pressable onPress={p.miss.onUseFreeze} style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: c.raised, flexDirection: 'row', alignItems: 'center', gap: 6 }} hitSlop={4}>
            <Snowflake size={16} color={c.textPrimary} /><Text style={{ ...t.headline, color: c.textPrimary }}>Use freeze</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row' }}>
        {p.week.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ height: 14, justifyContent: 'center' }}><Dot s={d} /></View>
            <Text style={{ ...t.caption, color: i === 6 ? c.textPrimary : c.textTertiary }}>{'MTWTFSS'[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function Dot({ s }: { s: WeekDot }) {
  if (s === 'frozen') return <Snowflake size={13} color={c.textPrimary} />;
  if (s === 'before') return <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.textTertiary }} />;
  const filled = s === 'secured' || s === 'todaySecured';
  return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: filled ? c.textPrimary : 'transparent',
    borderWidth: filled ? 0 : s === 'today' ? 2 : 1.5, borderColor: s === 'today' ? c.textPrimary : s === 'todayLost' ? c.textSecondary : c.textTertiary,
    borderStyle: s === 'todayLost' ? 'dashed' : 'solid' }} />;
}
