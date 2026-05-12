import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { DS_TYPE } from '@/lib/design-system';
import { resolveColor, type ColorVariant } from './_resolveColor';

type Props = {
  children: React.ReactNode;
  onDark?: boolean;
  color?: ColorVariant;
  style?: TextStyle;
} & Omit<TextProps, 'style' | 'children'>;

export default function Label({
  children,
  onDark = false,
  color = 'primary',
  style,
  ...rest
}: Props) {
  return (
    <Text
      style={[
        DS_TYPE.label,
        { color: resolveColor(onDark, color) },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
