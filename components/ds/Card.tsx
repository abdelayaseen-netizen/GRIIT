/**
 * Card — 01_components.md "Card"
 * Laws: 7 (weight from surface), 9 (surface, radius 20, 1pt border, no shadow),
 * 21 (card only for content read or tapped as one unit), 22 (no card in a card).
 */
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;

export type CardProps = ViewProps & {
  tint?: boolean;
  children?: React.ReactNode;
};

export default function Card({ tint, style, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[styles.card, tint ? styles.tint : styles.surface, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DS_V3.radius.card,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    padding: DS_V3.space.gutter,
  },
  surface: {
    backgroundColor: DS_V3.color.surface,
  },
  tint: {
    backgroundColor: DS_V3.color.brandTint,
  },
});
