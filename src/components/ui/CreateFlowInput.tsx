import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import * as tok from "@/src/theme/tokens";

type P = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
};

export function CreateFlowInput({ value, onChangeText, placeholder, label, multiline }: P) {
  return (
    <View style={st.wrap}>
      {label != null && <Text style={st.label}>{label}</Text>}
      <TextInput
        style={[st.input, multiline && st.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tok.colors.textSecondaryCreate}
        multiline={multiline}
      />
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { marginBottom: tok.spacing.gridM },
  label: {
    fontSize: tok.typography.label.fontSize,
    fontWeight: tok.typography.label.fontWeight,
    color: tok.colors.textPrimary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: tok.measures.inputHeight,
    backgroundColor: tok.colors.cardBg,
    borderRadius: tok.radius.inputCreate,
    borderWidth: 1.5,
    borderColor: tok.colors.borderLight,
    paddingHorizontal: tok.spacing.gridM,
    fontSize: tok.typography.primaryBody.fontSize,
    fontWeight: "500",
    color: tok.colors.textPrimary,
  },
  inputMultiline: {
    minHeight: tok.measures.inputHeight,
    paddingTop: 14,
  },
});
