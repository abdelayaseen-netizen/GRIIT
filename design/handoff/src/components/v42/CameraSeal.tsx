import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Camera, Clock, MapPin } from 'lucide-react-native';
import { Sheet } from '../ds/Sheet';

// Replaces the VERIFIED pill. Not a check mark: a check reads as a verified account.
// Render only when the completion has a camera proof (proof_photo_url / verified). Never on self-reported.
export function CameraSeal({ onPress, size = 28 }: { onPress: () => void; size?: 16 | 28 }) {
  return (
    <Pressable onPress={onPress} hitSlop={(44 - size) / 2} accessibilityRole="button" accessibilityLabel="Taken in the app with the camera. Show how this was proven.">
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(15,15,15,0.4)', borderWidth: 1, borderColor: 'rgba(245,243,238,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <Camera size={size / 2} color={color.textPrimary} />
      </View>
    </Pressable>
  );
}

export type PassedGates = { time?: string | null; place?: string | null }; // time: "5:00–6:30 am" | "By 7:00 am"
export function SealSheet({ visible, onDismiss, gates }: { visible: boolean; onDismiss: () => void; gates: PassedGates }) {
  const Row = ({ Icon, a, b }: any) => (
    <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20 }}>
      <Icon size={22} color={color.textPrimary} />
      <View style={{ gap: 1 }}><Text style={{ ...type.bodyStrong, color: color.textPrimary }}>{a}</Text>{b ? <Text style={{ ...type.caption, color: color.textSecondary }}>{b}</Text> : null}</View>
    </View>
  );
  return (
    <Sheet visible={visible} onDismiss={onDismiss} heading="How this was proven">
      <Row Icon={Camera} a="Taken in the app with the camera" b="Not uploaded from the camera roll" />
      {gates.time ? <Row Icon={Clock} a="Time" b={gates.time.startsWith('By') ? gates.time : 'Inside ' + gates.time} /> : null}
      {gates.place ? <Row Icon={MapPin} a="Location" b={'At ' + gates.place} /> : null}
    </Sheet>
  );
}
