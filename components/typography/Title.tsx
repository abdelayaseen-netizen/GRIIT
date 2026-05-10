import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { DS_TYPE } from '@/lib/design-system';
import { resolveColor, type ColorVariant } from './_resolveColor';

type Size = 'lg' | 'md' | 'sm';

type Props = {
  children: React.ReactNode;
  size?: Size;
  onDark?: boolean;
  color?: ColorVariant;
  style?: TextStyle;
} & Omit<TextProps, 'style' | 'children'>;

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
