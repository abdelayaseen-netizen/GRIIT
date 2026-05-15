import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

/** Inlined from lib/theme/tokens.ts `typography.label` — value-preserving migration (Phase 2). */
const THEME_TYPO_LABEL = {
  fontSize: 12,
  fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  lineHeight: 16,
};

type P = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  /** VoiceOver label for the text field (defaults to `label` when set) */
  accessibilityLabel?: string;
};

export function CreateFlowInput({ value, onChangeText, placeholder, label, multiline, accessibilityLabel }: P) {
  return (
    <View style={st.wrap}>
      {label != null && <Text style={st.label}>{label}</Text>}
      <TextInput
        style={[st.input, multiline && st.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={DS_COLORS.textSecondary}
        multiline={multiline}
        accessibilityLabel={accessibilityLabel ?? label}
      />
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { marginBottom: DS_SPACING.lg },
  label: {
    fontSize: THEME_TYPO_LABEL.fontSize,
    fontWeight: THEME_TYPO_LABEL.fontWeight,
    lineHeight: THEME_TYPO_LABEL.lineHeight,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: DS_MEASURES.CTA_HEIGHT_COMPACT,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.input,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    paddingHorizontal: DS_SPACING.lg,
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
  },
  inputMultiline: {
    minHeight: DS_MEASURES.CTA_HEIGHT_COMPACT,
    paddingTop: 14,
  },
});
