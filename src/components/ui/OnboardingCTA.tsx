import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS, DS_MEASURES, DS_SHADOWS } from "@/lib/design-system";

type Variant = "black" | "orange" | "outline";

type OnboardingCTAProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantConfig: Record<Variant, { bg: string; text: string; border?: string }> = {
  black: { bg: DS_COLORS.black, text: DS_COLORS.white },
  orange: { bg: DS_COLORS.accent, text: DS_COLORS.white },
  outline: { bg: "transparent", text: DS_COLORS.textPrimary, border: DS_COLORS.border },
};

export function OnboardingCTA({
  label,
  onPress,
  variant = "black",
  disabled = false,
  loading = false,
  style,
}: OnboardingCTAProps) {
  const config = variantConfig[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: config.bg },
        config.border && { borderWidth: 2, borderColor: config.border },
        isDisabled && styles.disabled,
        !isDisabled && variant !== "outline" && DS_SHADOWS.button,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={config.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: config.text }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: DS_MEASURES.ctaHeight,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_MEASURES.ctaHeight,
  },
  text: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: DS_TYPOGRAPHY.button.fontWeight,
  },
  disabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
});
