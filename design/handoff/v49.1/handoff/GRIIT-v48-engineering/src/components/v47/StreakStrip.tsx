// Home top block, v48 batch 1R (founder direction 1): flame + number + week strip FIRST, then one
// status line, then the one primary. No date, no name, no "Today" title above it.
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Flame, ChevronRight } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t, numberV46 } from '../../tokens.v46';
import { displayFace, displayWeight } from '../../tokens';
import { WeekStrip, DayState } from './WeekStrip';

export function StreakStrip(p: { streak: number; week: DayState[]; todayProgress: number; status: string; notice?: React.ReactNode; primary?: React.ReactNode; onOpenSheet: () => void }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 12 }}>
      <Pressable onPress={p.onOpenSheet} accessibilityRole="button" accessibilityLabel={`${p.streak} day streak. Opens the streak calendar.`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}>
        <Flame size={30} color={c.brand} fill={c.brand} />
        <Text style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: numberV46.M, lineHeight: 44, color: c.textPrimary, fontVariant: ['tabular-nums'] }}>{p.streak}</Text>
        <Text style={{ ...t.secondary, color: c.textPrimary, flex: 1 }}>day streak</Text>
        <ChevronRight size={20} color={c.textSecondary} />
      </Pressable>
      <WeekStrip days={p.week} progress={p.todayProgress} onPress={p.onOpenSheet} a11yLabel={weekLabel(p.week)} />
      {p.notice}
      <Text style={{ ...t.body, color: c.textPrimary }}>{p.status}</Text>
      {p.primary}
    </View>
  );
}

const WORD: Record<DayState, string> = { secured: 'secured', todayDone: 'secured', todayOpen: 'open', held: 'held by a freeze', lastStand: 'held by a Last Stand', missed: 'missed', future: 'ahead', beforeJoin: 'before you joined' };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const weekLabel = (w: DayState[]) => 'This week. ' + w.map((s, i) => `${DAYS[i]} ${WORD[s]}`).join(', ') + '.';
