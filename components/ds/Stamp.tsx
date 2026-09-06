/**
 * Stamp — 01_components.md "Stamp"
 * Laws: 2 (Barlow Condensed 600 only here and DisplayNumber), 11 (uppercase the
 * string in JS; Android has no textTransform). Never on self reported content.
 * Spec label is "Verified" | "Complete"; uppercase at render.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const STROKE = (DS_V3.space.xs * 3) / 8;

export type StampLabel = "Verified" | "Complete";

export type StampProps = {
  label?: StampLabel;
  onInk?: boolean;
};

export default function Stamp({ label = "Verified", onInk }: StampProps) {
  const color = onInk ? DS_V3.color.textPrimary : DS_V3.color.brandText;
  return (
    <View style={[styles.frame, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "flex-start",
    borderWidth: STROKE,
    borderRadius: DS_V3.radius.input,
    paddingVertical: DS_V3.space.xs * 1.5,
    paddingHorizontal: DS_V3.space.xs * 2.5,
  },
  label: {
    fontSize: DS_V3.type.stamp.fontSize,
    lineHeight: DS_V3.type.stamp.lineHeight,
    fontWeight: DS_V3.type.stamp.fontWeight,
    fontFamily: DS_V3.type.stamp.fontFamily,
    letterSpacing: DS_V3.type.stamp.letterSpacing,
  },
});
