// v47 frame 192, recreated for v48 batch 1R. LOCKED: 8 states, readable in greyscale.
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, Snowflake, Shield } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';

export type DayState = 'secured' | 'todayDone' | 'todayOpen' | 'held' | 'lastStand' | 'missed' | 'future' | 'beforeJoin';
export const STRIP_SIZE = { home: 30, detail: 30, sheet: 36, profile: 20 } as const;
const MISS = '#6B6967';
const glyph = (s: number) => (s >= 36 ? 15 : s <= 20 ? 9 : 13);

export function DayCircle({ state, size = 30, progress = 0, ground = c.canvas }: { state: DayState; size?: number; progress?: number; ground?: string }) {
  const g = glyph(size), r = size / 2;
  const base = { width: size, height: size, borderRadius: r, alignItems: 'center' as const, justifyContent: 'center' as const };
  switch (state) {
    case 'secured': return <View style={{ ...base, backgroundColor: c.textPrimary }}><Check size={g} color={c.canvas} strokeWidth={3} /></View>;
    case 'todayDone': // filled + 2pt ring 3pt outside, drawn as a wrapper so layout size stays `size`
      return <View style={{ ...base }}><View style={{ position: 'absolute', width: size + 10, height: size + 10, borderRadius: r + 5, borderWidth: 2, borderColor: c.textPrimary }} /><View style={{ ...base, backgroundColor: c.textPrimary }}><Check size={g} color={c.canvas} strokeWidth={3} /></View></View>;
    case 'held': return <View style={{ ...base, backgroundColor: c.raised, borderWidth: 1.5, borderColor: MISS }}><Snowflake size={g} color={c.textPrimary} strokeWidth={2.5} /></View>;
    case 'lastStand': return <View style={{ ...base, backgroundColor: c.raised, borderWidth: 1.5, borderColor: MISS }}><Shield size={g} color={c.textPrimary} strokeWidth={2.5} /></View>;
    case 'missed': return <View style={{ ...base, borderWidth: 1.5, borderColor: MISS }}><View style={{ width: Math.round(size * 0.3), height: 2, borderRadius: 1, backgroundColor: c.textSecondary }} /></View>;
    case 'future': return <View style={{ ...base, borderWidth: 1.5, borderColor: c.textTertiary, borderStyle: 'dashed' }} />;
    case 'beforeJoin': return <View style={base}><View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.textTertiary }} /></View>;
    case 'todayOpen': {
      const R = r - 1, len = 2 * Math.PI * R;
      return <Svg width={size} height={size}><Circle cx={r} cy={r} r={R} stroke={c.textTertiary} strokeWidth={2} fill={ground} />
        {progress > 0 ? <Circle cx={r} cy={r} r={R} stroke={c.textPrimary} strokeWidth={2} fill="none" strokeDasharray={`${len * progress} ${len}`} transform={`rotate(-90 ${r} ${r})`} /> : null}</Svg>;
    }
  }
}

// The whole strip is one button that opens StreakSheet. VoiceOver reads one sentence, not seven circles.
export function WeekStrip({ days, size = 30, progress = 0, todayIndex = 6, letters = 'MTWTFSS', onPress, a11yLabel }: { days: DayState[]; size?: number; progress?: number; todayIndex?: number; letters?: string; onPress?: () => void; a11yLabel: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11yLabel} style={{ flexDirection: 'row', minHeight: 44 }}>
      {days.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={{ ...t.caption, fontSize: 11, lineHeight: 13, color: i === todayIndex ? c.textPrimary : c.textSecondary }}>{letters[i]}</Text>
          <DayCircle state={d} size={size} progress={i === todayIndex ? progress : 0} />
        </View>
      ))}
    </Pressable>
  );
}
