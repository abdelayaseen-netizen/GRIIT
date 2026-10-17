// v48 batch 2 cover generator. Covers NEVER come from proof photos (Part 4: Discover hero showed "Task").
import React from 'react';
import { View, Text } from 'react-native';
import { Dumbbell, Moon, Sun, Leaf, Target, BookOpen } from 'lucide-react-native';
import { colorV46 as c } from '../../tokens.v46';
import { displayFace, displayWeight } from '../../tokens';

export type Category = 'Fitness' | 'Faith' | 'Mind' | 'Health' | 'Discipline' | 'Learning';
// Flag 199: raised in chroma from tokens.v46 categoryTint so six covers separate by colour alone.
export const COVER_TINT: Record<Category, string> = { Fitness: '#2F4A66', Faith: '#4A3A6B', Mind: '#2F5A4C', Health: '#1F5560', Discipline: '#5E4A30', Learning: '#5A5420' };
const ICON = { Fitness: Dumbbell, Faith: Moon, Mind: Sun, Health: Leaf, Discipline: Target, Learning: BookOpen };

export function Cover({ category, days, width, height, radius = 14 }: { category: Category; days: number; width: number; height: number; radius?: number }) {
  const I = ICON[category], big = width >= 200, tint = COVER_TINT[category];
  // gradient: 160deg tint → #151414 (use react-native-linear-gradient in the app)
  if (width < 60) return <View style={{ width, height, borderRadius: radius, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: Math.round(width * 0.42), color: c.textPrimary }}>{days}</Text></View>;
  return (
    <View style={{ width, height, borderRadius: radius, backgroundColor: tint, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: big ? 16 : 10, top: big ? 14 : 10 }}><I size={big ? 22 : 16} color={c.textPrimary} /></View>
      <View style={{ position: 'absolute', left: big ? 16 : 10, bottom: big ? 14 : 10 }}>
        <Text style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: Math.round(width * 0.3), lineHeight: Math.round(width * 0.3), color: c.textPrimary }}>{days}</Text>
        <Text style={{ fontSize: big ? 13 : 11, fontWeight: '500', color: c.textPrimary, opacity: 0.86 }}>days</Text>
      </View>
    </View>
  );
}
