// Today list row + section, and the one gate-line builder every screen calls.
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Camera, Clock, MapPin, Check, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';

export type Gate = { kind: 'camera' } | { kind: 'time'; by?: string; from?: string; to?: string } | { kind: 'location' };
export type TaskLine = { target?: string; gates: Gate[]; photoMode: 'required' | 'optional' | 'none'; window?: 'open' | 'notOpen' | 'closed'; minutesLeft?: number };

// Order is fixed: Camera, Time, Location. No gate and no photo -> "Self-reported".
export function gateParts(l: TaskLine): { icon?: 'camera' | 'clock' | 'pin'; text: string }[] {
  const time = l.gates.find(g => g.kind === 'time') as any;
  if (l.window === 'closed' && time) return [{ icon: 'clock', text: `Window closed · ${time.from}–${time.to}` }];
  if (l.window === 'notOpen' && time) return [{ icon: 'clock', text: `Opens at ${time.from ?? time.by}` }];   // never "midnight"
  const out: { icon?: 'camera' | 'clock' | 'pin'; text: string }[] = [];
  if (l.target) out.push({ text: l.target });
  if (l.photoMode === 'required') out.push({ icon: 'camera', text: 'Camera' });
  if (l.photoMode === 'optional') out.push({ icon: 'camera', text: 'Photo optional' });
  if (time) out.push({ icon: 'clock', text: (time.by ? `By ${time.by}` : `${time.from}–${time.to}`) + (l.minutesLeft != null ? ` · ${l.minutesLeft} min left` : '') });
  if (l.gates.some(g => g.kind === 'location')) out.push({ icon: 'pin', text: 'Location' });
  if (l.photoMode === 'none' && !l.gates.some(g => g.kind === 'location')) out.splice(l.target ? 1 : 0, 0, { text: 'Self-reported' });
  return out;
}
const ICON = { camera: Camera, clock: Clock, pin: MapPin };
export function GateLine({ line }: { line: TaskLine }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
      {gateParts(line).map((p, i) => { const I = p.icon ? ICON[p.icon] : null; return (
        <React.Fragment key={i}>{i ? <Text style={{ ...t.secondary, color: c.textSecondary }}>·</Text> : null}{I ? <I size={13} color={c.textSecondary} /> : null}<Text style={{ ...t.secondary, color: c.textSecondary }}>{p.text}</Text></React.Fragment>
      ); })}
    </View>
  );
}

export function TaskRow({ name, line, state, onPress }: { name: string; line: TaskLine; state: 'open' | 'done' | 'closed'; onPress?: () => void }) {
  return (
    <Pressable onPress={state === 'open' ? onPress : undefined} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 }}>
      {state === 'done' ? <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.raised, alignItems: 'center', justifyContent: 'center' }}><Check size={16} color={c.brand} strokeWidth={3} /></View>
        : state === 'closed' ? <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#6B6967', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 10, height: 2, backgroundColor: c.textSecondary }} /></View>
        : <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: c.textTertiary }} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...t.headline, color: state === 'open' ? c.textPrimary : c.textSecondary }}>{name}</Text>
        <GateLine line={line} />
      </View>
      {state === 'open' ? <ChevronRight size={18} color={c.textSecondary} /> : null}
    </Pressable>
  );
}

// One surface card per challenge. A first day is this caption ("Day 1 of 30"), never a Home-level line.
export function TodaySection(p: { name: string; dayLine: string; done: number; total: number; collapsed: boolean; onToggle: () => void; children: React.ReactNode }) {
  const Chev = p.collapsed ? ChevronDown : ChevronUp;
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 }}>
      <Pressable onPress={p.onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}>
        <View style={{ flex: 1 }}><Text style={{ ...t.headline, color: c.textPrimary }}>{p.name}</Text><Text style={{ ...t.secondary, color: c.textSecondary }}>{p.dayLine}</Text></View>
        <Text style={{ ...t.secondary, color: c.textSecondary }}>{p.done} of {p.total} done</Text><Chev size={16} color={c.textSecondary} />
      </Pressable>
      {p.collapsed ? null : p.children}
    </View>
  );
}
