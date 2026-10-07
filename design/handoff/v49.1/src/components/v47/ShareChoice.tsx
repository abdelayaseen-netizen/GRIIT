// The share choice and the task-complete toast. Private by default: no answer = private.
// Camera task -> shares its photo. Every other type -> "Share as a card" (task, not content).
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Check, Lock, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { colorV46 as c, typeV46 as t } from '../../tokens.v46';

export type ShareState = 'unanswered' | 'shared' | 'kept' | 'failed';

const Btn = ({ label, onPress, bg }: { label: string; onPress: () => void; bg: string }) => (
  <Pressable onPress={onPress} style={{ flex: 1, height: 44, borderRadius: 999, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ ...t.headline, color: c.textPrimary }}>{label}</Text>
  </Pressable>
);

export function ShareChoice(p: { state: ShareState; isPhoto: boolean; onShare: () => void; onKeep: () => void; onUndo: () => void; onRetry: () => void; ground?: string }) {
  const bg = p.ground ?? c.raised;
  if (p.state === 'shared') return <Row icon={<CheckCircle2 size={18} color={c.textPrimary} />} text="Shared to the feed." action={<Pressable onPress={p.onUndo} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ ...t.headline, color: c.textPrimary }}>Undo</Text></Pressable>} />;
  if (p.state === 'kept') return <Row icon={<Lock size={18} color={c.textPrimary} />} text="Kept private. Share it later from Profile, Proofs." />;
  if (p.state === 'failed') return <Row icon={<AlertCircle size={18} color={c.textPrimary} />} text="Couldn’t share. It’s still private." action={<Btn label="Try again" onPress={p.onRetry} bg={bg} />} />;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn label={p.isPhoto ? 'Share to the feed' : 'Share as a card'} onPress={p.onShare} bg={bg} />
        <Btn label="Keep it to the record" onPress={p.onKeep} bg={bg} />
      </View>
      <Text style={{ ...t.caption, color: c.textSecondary, textAlign: 'center' }}>No answer keeps it private.</Text>
    </View>
  );
}
const Row = ({ icon, text, action }: { icon: React.ReactNode; text: string; action?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}>{icon}<Text style={{ ...t.headline, color: c.textPrimary, flex: 1 }}>{text}</Text>{action}</View>
);

// Sits 12pt above the tab bar (bottom = 83 + 12). Never shown when the task secured the day: Secured owns the share block.
export function TaskCompleteToast(p: { title: string; sub: string; photoUri?: string; share?: React.ReactNode }) {
  return (
    <View style={{ position: 'absolute', left: 10, right: 10, bottom: 95, backgroundColor: c.raised, borderRadius: 18, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {p.photoUri ? <Image source={{ uri: p.photoUri }} style={{ width: 40, height: 50, borderRadius: 8 }} />
          : <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Check size={18} color={c.brand} strokeWidth={3} /></View>}
        <View style={{ flex: 1 }}><Text style={{ ...t.headline, color: c.textPrimary }}>{p.title}</Text><Text style={{ ...t.secondary, color: c.textSecondary }}>{p.sub}</Text></View>
      </View>
      {p.share}
    </View>
  );
}
