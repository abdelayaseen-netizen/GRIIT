import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  accessibilityLabel?: string;
};

export default function FormInput({ label, value, onChangeText, placeholder, error, accessibilityLabel }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={DS_COLORS.TEXT_MUTED}
        style={[s.input, error && s.inputError]}
        accessibilityLabel={accessibilityLabel ?? label}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: DS_SPACING.md },
  label: { marginBottom: DS_SPACING.xs, color: DS_COLORS.TEXT_PRIMARY, fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "600" },
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
  error: { marginTop: DS_SPACING.xs, color: DS_COLORS.DANGER, fontSize: DS_TYPOGRAPHY.SIZE_XS },
});

