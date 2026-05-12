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

export default function Caption({
  children,
  onDark = false,
  color = 'primary',
  style,
  ...rest
}: Props) {
  return (
    <Text
      style={[
        DS_TYPE.caption,
        { color: resolveColor(onDark, color) },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
