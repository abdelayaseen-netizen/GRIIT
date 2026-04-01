import React from "react";
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { colors } from "@/lib/theme/colors";
import { radius } from "@/lib/theme/radius";
import { typography } from "@/lib/theme/typography";

const HEIGHT = 54;

type InputProps = TextInputProps & { containerStyle?: ViewStyle };

function InputInner({
  containerStyle,
  style,
  placeholderTextColor = colors.textSubtle,
  ...rest
}: InputProps) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor}
        {...rest}
      />
    </View>
  );
}

export const Input = React.memo(InputInner);

const styles = StyleSheet.create({
  wrap: { minHeight: HEIGHT },
  input: {
    height: HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    ...typography.body,
    color: colors.text,
  },
});
