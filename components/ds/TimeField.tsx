/**
 * TimeField — 115. Tappable 12-hour display; opens a sheet spinner.
 * Not a TextField: a non-editable input still flashes the keyboard.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { fmt12 } from "@/lib/time-gate-picker";

const PT = DS_V3.space.xs / 4;
const STROKE = (DS_V3.space.xs * 3) / 8;

export type TimeFieldProps = {
  label: "By" | "From" | "To";
  value: string;
  invalid?: boolean;
  active?: boolean;
  onPress: () => void;
};

export default function TimeField({
  label,
  value,
  invalid,
  active,
  onPress,
}: TimeFieldProps) {
  const shown = fmt12(value) || value;
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${shown}`}
        onPress={onPress}
        style={[
          styles.field,
          invalid ? styles.invalid : active ? styles.active : null,
        ]}
      >
        <Text style={styles.value}>{shown}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  field: {
    minHeight: DS_V3.size.button,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: DS_V3.space.lg,
    justifyContent: "center",
  },
  invalid: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.danger,
  },
  active: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
  value: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
});
