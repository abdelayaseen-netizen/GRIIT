/**
 * TextLink — 44 hit, brandText body. Chunk K auth links.
 */
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export type TextLinkProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export default function TextLink({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      hitSlop={DS_V3.space.sm}
      style={({ pressed }) => [styles.hit, pressed && !disabled ? styles.pressed : null]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minHeight: DS_V3.size.tap,
    minWidth: DS_V3.size.tap,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.brandText,
  },
});
