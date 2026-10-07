import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colorV46 as c, typeV46 as t, categoryTint } from '../../tokens.v46';
import { displayFace, displayWeight } from '../../tokens';
import { Dumbbell, Moon, Brain, HeartPulse, AlarmClock, BookOpen } from 'lucide-react-native';

// D4 / F3. Every challenge gets a typographic cover. No photo is ever used as a cover.
const ICON = { Fitness: Dumbbell, Faith: Moon, Mind: Brain, Health: HeartPulse, Discipline: AlarmClock, Learning: BookOpen };
export type Category = keyof typeof categoryTint;
export function Cover({ category, days, size = 'featured' }: { category: Category; days: number; size?: 'featured' | 'grid' }) {
  const Icon = ICON[category];
  const big = size === 'featured';
  return (
    <LinearGradient colors={[categoryTint[category], '#151414']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
      style={big ? { width: 160, height: 200, borderRadius: 16 } : { width: '100%', aspectRatio: 4 / 5, borderRadius: 16 }}>
      <View style={{ position: 'absolute', right: 12, top: 12 }}><Icon size={big ? 22 : 18} color="rgba(242,240,235,0.7)" /></View>
      <View style={{ position: 'absolute', left: 14, bottom: 12 }}>
        <Text style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: big ? 64 : 48, lineHeight: big ? 60 : 46, color: c.textPrimary, fontVariant: ['tabular-nums'] }}>{days}</Text>
        <Text style={{ ...t.label, color: 'rgba(242,240,235,0.7)' }}>{days === 1 ? 'day' : 'days'}</Text>
      </View>
    </LinearGradient>
  );
}
// Meta line: always "{duration} · {gate}". Social proof only when true.
export function coverMeta(days: number, gate: string) { return days + (days === 1 ? ' day' : ' days') + ' · ' + gate; }
export function inItLine(n: number) { return n > 0 ? n + ' in it' : null; }
