import React from "react";
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";

/** Inlined from lib/theme/typography.ts `typography.body` — value-preserving migration (Phase 2). */
const THEME_TYPO_BODY = {
  fontSize: 16,
  fontWeight: "500" as const,
  lineHeight: 22,
};

const HEIGHT = 54;

type InputProps = TextInputProps & { containerStyle?: ViewStyle };

function InputInner({
  containerStyle,
  style,
  placeholderTextColor = DS_COLORS.textMuted,
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
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.surface,
    paddingHorizontal: 16,
    ...THEME_TYPO_BODY,
    color: DS_COLORS.textPrimary,
  },
});
