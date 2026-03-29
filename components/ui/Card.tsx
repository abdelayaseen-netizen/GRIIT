import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_SHADOWS } from '@/lib/design-system';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'tinted' | 'green';
  noPadding?: boolean;
}

export function Card({ children, style, variant = 'default', noPadding = false }: CardProps) {
  const variantStyles = {
    default: {
      backgroundColor: DS_COLORS.BG_CARD,
      borderColor: DS_COLORS.BORDER_CARD,
    },
    tinted: {
      backgroundColor: DS_COLORS.BG_CARD_TINTED,
      borderColor: DS_COLORS.BORDER_CARD,
    },
    green: {
      backgroundColor: DS_COLORS.ACCENT_GREEN_BG,
      borderColor: DS_COLORS.COMPLETED_BORDER,
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        noPadding ? {} : styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    ...DS_SHADOWS.card,
  },
  padding: {
    padding: DS_SPACING.BASE,
  },
});

export default Card;
