/**
 * Switch — frame 42. 51×31. Brand on-track, border off-track.
 */
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;
const PAD = (TRACK_H - THUMB) / 2;
const PT = DS_V3.space.xs / 4;

export type SwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export default function Switch({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={Math.max(0, (DS_V3.size.tap - TRACK_H) / 2)}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.track,
        value ? styles.on : styles.off,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.thumb,
          { left: value ? TRACK_W - THUMB - PAD : PAD },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: DS_V3.radius.pill,
    justifyContent: "center",
  },
  on: {
    backgroundColor: DS_V3.color.brand,
  },
  off: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.textPrimary,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
});
