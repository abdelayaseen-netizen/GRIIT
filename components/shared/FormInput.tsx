import React from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  textAlignVertical?: "auto" | "top" | "center" | "bottom";
};

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  accessibilityLabel,
  containerStyle,
  inputStyle,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  multiline,
  numberOfLines,
  returnKeyType,
  editable,
  onFocus,
  onBlur,
  onSubmitEditing,
  textAlignVertical,
}: Props) {
  return (
    <View style={[s.wrap, containerStyle]}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={DS_COLORS.TEXT_MUTED}
        style={[s.input, multiline && s.inputMultiline, error && s.inputError, inputStyle]}
        accessibilityLabel={accessibilityLabel ?? label}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        returnKeyType={returnKeyType}
        editable={editable}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        textAlignVertical={textAlignVertical}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: DS_SPACING.md },
  label: { marginBottom: DS_SPACING.xs, color: DS_COLORS.TEXT_PRIMARY, fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
  input: {
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    borderRadius: DS_RADIUS.input,
    backgroundColor: DS_COLORS.WHITE,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
    color: DS_COLORS.TEXT_PRIMARY,
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
  },
  inputError: { borderColor: DS_COLORS.DANGER },
  inputMultiline: { minHeight: 100, paddingTop: DS_SPACING.md },
  error: { marginTop: DS_SPACING.xs, color: DS_COLORS.DANGER, fontSize: DS_TYPOGRAPHY.SIZE_XS },
});

