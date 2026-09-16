/**
 * Divider — 1pt border hairline. Prototype Primitives.tsx Divider.
 */
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;

export type DividerProps = ViewProps;

export default function Divider({ style, ...rest }: DividerProps) {
  return <View {...rest} style={[styles.line, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: PT,
    backgroundColor: DS_V3.color.border,
  },
});
