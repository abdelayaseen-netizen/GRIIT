/**
 * ControlPill — 01_components.md. Rank between Chip and Button secondary.
 * Acts on the screen without finishing it. Never in a pinned footer.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Image as ImageIcon,
  Keyboard,
  Minus,
  Pause,
  RotateCcw,
  Square,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.gutter - 2;

const ICONS: Record<string, LucideIcon> = {
  pause: Pause,
  "rotate-ccw": RotateCcw,
  minus: Minus,
  keyboard: Keyboard,
  square: Square,
  x: X,
  image: ImageIcon,
};

export type ControlPillProps = {
  label: string;
  icon?: string;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export default function ControlPill({
  label,
  icon,
  disabled,
  onPress,
  accessibilityLabel,
}: ControlPillProps) {
  const Glyph = icon ? ICONS[icon] : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      android_ripple={null}
      style={({ pressed }) => [
        styles.pill,
        disabled ? styles.disabled : null,
        !disabled && pressed ? styles.pressed : null,
      ]}
    >
      {Glyph ? (
        <Glyph
          size={ICON}
          color={DS_V3.color.textSecondary}
          strokeWidth={2}
        />
      ) : null}
      <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.lg,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  labelDisabled: {
    color: DS_V3.color.textSecondary,
  },
});

export function ControlPillRow({ children }: { children: React.ReactNode }) {
  return <View style={rowStyles.row}>{children}</View>;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: DS_V3.space.sm,
    flexWrap: "wrap",
  },
});
