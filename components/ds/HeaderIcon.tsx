/**
 * HeaderIcon — 01_components.md RootHeader actions: 44 circles, surface, 1pt border.
 */
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;

export type HeaderIconProps = {
  accessibilityLabel: string;
  onPress?: () => void;
  children: React.ReactNode;
};

export default function HeaderIcon({
  accessibilityLabel,
  onPress,
  children,
}: HeaderIconProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
