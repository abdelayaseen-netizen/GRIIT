import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as t from "@/src/theme/tokens";

type Variant = "orange" | "green";

interface PrimaryButtonCreateProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function PrimaryButtonCreate({
  label,
  onPress,
  variant = "orange",
  disabled = false,
  loading = false,
  fullWidth = true,
}: PrimaryButtonCreateProps) {
  const isGreen = variant === "green";
  return (
    <TouchableOpacity
      style={[
        s.button,
        isGreen && s.buttonGreen,
        disabled && s.buttonDisabled,
        fullWidth && s.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={t.colors.white} />
      ) : (
        <Text style={s.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    height: t.measures.primaryButtonHeight,
    borderRadius: t.radius.cardCreate,
    backgroundColor: t.colors.accentOrangeCreate,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.gridL,
  },
  buttonGreen: {
    backgroundColor: t.colors.accentGreen,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: 17,
    fontWeight: "600",
    color: t.colors.white,
  },
});
