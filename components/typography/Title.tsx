import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { DS_TYPE, DS_COLORS_V2 } from '@/lib/design-system';

type ColorVariant = 'primary' | 'secondary' | 'tertiary';
type Size = 'lg' | 'md' | 'sm';

type Props = {
  children: React.ReactNode;
  size?: Size;
  onDark?: boolean;
  color?: ColorVariant;
  style?: TextStyle;
} & Omit<TextProps, 'style' | 'children'>;

function resolveColor(onDark: boolean, variant: ColorVariant): string {
  if (onDark) {
    if (variant === 'primary') return DS_COLORS_V2.text.onDark;
    if (variant === 'secondary') return DS_COLORS_V2.text.onDarkSecondary;
    return DS_COLORS_V2.text.onDarkTertiary;
  }
  if (variant === 'primary') return DS_COLORS_V2.text.primary;
  if (variant === 'secondary') return DS_COLORS_V2.text.secondary;
  return DS_COLORS_V2.text.tertiary;
}

export default function Title({
  children,
  size = 'lg',
  onDark = false,
  color = 'primary',
  style,
  ...rest
}: Props) {
  return (
    <Text
      style={[
        DS_TYPE.title[size],
        { color: resolveColor(onDark, color) },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
