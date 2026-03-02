import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "@/src/theme/colors";
import { radius } from "@/src/theme/radius";
import { shadows } from "@/src/theme/shadows";

type CardProps = {
  children: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
};

export function Card({ children, pressable = false, onPress, selected = false, style }: CardProps) {
  const cardStyle = [styles.card, selected && styles.selected];

  if (pressable && onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8} accessibilityRole="button">
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  selected: { borderColor: colors.borderStrong, borderWidth: 2 },
});
