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
  /** textSecondary. Forgot password, locked resend. */
  tone?: "brand" | "secondary";
  /** 0.6 opacity, inert. Resend countdown. */
  inert?: boolean;
  accessibilityLabel?: string;
};

export default function TextLink({
  label,
  onPress,
  disabled,
  tone = "brand",
  inert,
  accessibilityLabel,
}: TextLinkProps) {
  const blocked = Boolean(disabled || inert);
  const secondary = tone === "secondary" || inert;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: blocked }}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      hitSlop={DS_V3.space.sm}
      style={({ pressed }) => [
        styles.hit,
        inert ? styles.inert : null,
        pressed && !blocked ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.label, secondary ? styles.secondary : null]}>{label}</Text>
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
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  secondary: {
    color: DS_V3.color.textSecondary,
  },
  inert: {
    opacity: 0.6,
  },
});
