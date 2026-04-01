import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "@/lib/theme/colors";
import { radius } from "@/lib/theme/radius";
import { shadows } from "@/lib/theme/shadows";
import { typography } from "@/lib/theme/typography";

type Variant = "black" | "accent" | "success" | "ghost" | "outline";

const HEIGHT = 56;

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  black: { bg: colors.blackBtn, text: colors.white },
  accent: { bg: colors.accent, text: colors.white },
  success: { bg: colors.success, text: colors.white },
  ghost: { bg: "transparent", text: colors.text },
  outline: { bg: "transparent", text: colors.text, border: colors.border },
};

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Overrides default label (defaults to `title`). */
  accessibilityLabel?: string;
};

function PrimaryButtonInner({
  title,
  onPress,
  variant = "black",
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel: accessibilityLabelProp,
}: PrimaryButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 2, borderColor: v.border },
        isDisabled && styles.disabled,
        !isDisabled && variant !== "ghost" && variant !== "outline" && shadows.button,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelProp ?? title}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text }]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export const PrimaryButton = React.memo(PrimaryButtonInner);

const styles = StyleSheet.create({
  btn: {
    height: HEIGHT,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    ...typography.body,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
});
