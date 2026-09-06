/**
 * Button — 01_components.md "Button"
 * Laws: 6 (one brand fill per viewport), 7 (brand + onBrand; never textPrimary on brand),
 * 20 (44 minimum hit), 22 (inside a card: filled or tertiary, never outlined).
 * Spec wins over design/handoff/src/components/Primitives.tsx:25 (that file fills
 * primary with brandText / surface; spec is brand / onBrand).
 */
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 6;

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "regular" | "small";

export type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  destructive?: boolean;
  submitting?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export default function Button({
  label,
  variant = "primary",
  size = "regular",
  destructive,
  submitting,
  disabled,
  icon,
  onPress,
  accessibilityLabel,
}: ButtonProps) {
  const height = size === "small" ? DS_V3.size.buttonSmall : DS_V3.size.button;
  const blocked = Boolean(disabled || submitting);
  const pad = Math.max(0, (DS_V3.size.tap - height) / 2);
  const labelColor =
    variant === "primary"
      ? DS_V3.color.onBrand
      : variant === "secondary"
        ? DS_V3.color.textPrimary
        : destructive
          ? DS_V3.color.danger
          : DS_V3.color.brandText;
  const spinnerColor = variant === "primary" ? DS_V3.color.onBrand : labelColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: blocked }}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      hitSlop={pad > 0 ? { top: pad, bottom: pad, left: pad, right: pad } : undefined}
      style={({ pressed }) => [
        styles.base,
        { height, minHeight: height, minWidth: DS_V3.size.tap },
        size === "small" ? styles.padSmall : styles.padRegular,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "tertiary" && styles.tertiary,
        blocked && (submitting ? styles.submitting : styles.disabled),
        !blocked && pressed ? styles.pressed : null,
      ]}
    >
      {submitting ? (
        <ActivityIndicator
          color={spinnerColor}
          size="small"
          style={styles.spinner}
        />
      ) : icon ? (
        <View style={styles.icon} accessibilityElementsHidden>
          {icon}
        </View>
      ) : null}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: DS_V3.radius.pill,
    paddingHorizontal: DS_V3.space.xs * 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  padRegular: {
    paddingHorizontal: DS_V3.space.xs * 7,
  },
  padSmall: {
    paddingHorizontal: DS_V3.space.xs * 6,
  },
  primary: {
    backgroundColor: DS_V3.color.brand,
  },
  secondary: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
  submitting: {
    opacity: 0.6,
  },
  spinner: {
    width: DS_V3.space.gutter,
    height: DS_V3.space.gutter,
    marginRight: DS_V3.space.sm,
  },
  icon: {
    width: ICON,
    height: ICON,
    marginRight: DS_V3.space.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
  },
});
