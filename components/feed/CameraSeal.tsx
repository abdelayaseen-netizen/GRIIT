import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, Clock, MapPin } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Sheet from "@/components/ds/Sheet";
import { showCameraSeal } from "@/lib/feed-join";

export { showCameraSeal };

export function CameraSeal({ onPress, size = 28 }: { onPress: () => void; size?: 16 | 28 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(44 - size) / 2}
      accessibilityRole="button"
      accessibilityLabel="Taken in the app with the camera. Show how this was proven."
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "rgba(15,15,15,0.4)",
          borderWidth: 1,
          borderColor: "rgba(245,243,238,0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Camera size={size / 2} color={DS_V3.color.textPrimary} />
      </View>
    </Pressable>
  );
}

export type PassedGates = { time?: string | null; place?: string | null };

export function SealSheet({
  visible,
  onDismiss,
  gates,
}: {
  visible: boolean;
  onDismiss: () => void;
  gates: PassedGates;
}) {
  return (
    <Sheet visible={visible} onDismiss={onDismiss} heading="How this was proven">
      <View style={styles.row}>
        <Camera size={22} color={DS_V3.color.textPrimary} />
        <View style={styles.copy}>
          <Text style={styles.a}>Taken in the app with the camera</Text>
          <Text style={styles.b}>Not uploaded from the camera roll</Text>
        </View>
      </View>
      {gates.time ? (
        <View style={styles.row}>
          <Clock size={22} color={DS_V3.color.textPrimary} />
          <View style={styles.copy}>
            <Text style={styles.a}>Time</Text>
            <Text style={styles.b}>{gates.time.startsWith("By") ? gates.time : `Inside ${gates.time}`}</Text>
          </View>
        </View>
      ) : null}
      {gates.place ? (
        <View style={styles.row}>
          <MapPin size={22} color={DS_V3.color.textPrimary} />
          <View style={styles.copy}>
            <Text style={styles.a}>Location</Text>
            <Text style={styles.b}>{`At ${gates.place}`}</Text>
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: DS_V3.space.gutter,
  },
  copy: { gap: 1 },
  a: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  b: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
