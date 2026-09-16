/**
 * Spinner — 20 in-button (also Button's own indicator) and 44 takeover.
 * Sizes map to DS_V3.space.gutter and DS_V3.size.tap. No spinner token.
 */
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export type SpinnerSize = 20 | 44;

export type SpinnerProps = {
  size?: SpinnerSize;
};

export default function Spinner({ size = 20 }: SpinnerProps) {
  const dim = size === 44 ? DS_V3.size.tap : DS_V3.space.gutter;
  return (
    <ActivityIndicator
      color={DS_V3.color.brand}
      size={size === 44 ? "large" : "small"}
      style={[styles.box, { width: dim, height: dim }]}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    alignSelf: "center",
  },
});
