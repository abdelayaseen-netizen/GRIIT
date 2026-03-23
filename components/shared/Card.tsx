import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING } from "@/lib/design-system";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  accessibilityLabel?: string;
};

export default function Card({ children, onPress, padded = true, accessibilityLabel }: Props) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? "Card action"}
        style={[s.base, padded && s.padded]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[s.base, padded && s.padded]}>{children}</View>;
}

const s = StyleSheet.create({
  base: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    ...DS_SHADOWS.cardSubtle,
  },
  padded: {
    padding: DS_SPACING.cardPadding,
  },
});

