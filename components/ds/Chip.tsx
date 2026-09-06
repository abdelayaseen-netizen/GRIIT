/**
 * Chip — 01_components.md "Chip"
 * Laws: 6 (selected uses brandText / brandTint, never a brand fill), 20 (44 hit),
 * 23 (ghost chips under a heading, never directly under a SegmentedControl).
 * form chips are Create wizard only (spec Never).
 */
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;
const STROKE = (DS_V3.space.xs * 3) / 8;

export type ChipVariant = "ghost" | "form";

export type ChipProps = {
  label: string;
  selected?: boolean;
  variant?: ChipVariant;
  onPress?: () => void;
};

export default function Chip({
  label,
  selected = false,
  variant = "ghost",
  onPress,
}: ChipProps) {
  const ghost = variant === "ghost";
  const color = selected
    ? DS_V3.color.brandText
    : ghost
      ? DS_V3.color.textSecondary
      : DS_V3.color.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        ghost && !selected ? styles.ghost : null,
        ghost && selected ? styles.ghostSelected : null,
        !ghost && !selected ? styles.form : null,
        !ghost && selected ? styles.formSelected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color,
            fontWeight: selected ? DS_V3.type.bodyStrong.fontWeight : DS_V3.type.secondary.fontWeight,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.lg,
    borderRadius: DS_V3.radius.input,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostSelected: {
    backgroundColor: DS_V3.color.brandTint,
  },
  form: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  formSelected: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
  },
});
