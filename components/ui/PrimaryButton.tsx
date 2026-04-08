import { DS_TYPOGRAPHY } from "@/lib/design-system";
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
import * as t from "@/lib/theme/tokens";

type Variant = "black" | "accent" | "success" | "ghost" | "outline" | "create" | "createGreen";

const HEIGHT = 56;

const variantStyles: Record<Exclude<Variant, "create" | "createGreen">, { bg: string; text: string; border?: string }> = {
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
  /** Create-flow full width (default true). Ignored for standard variants. */
  fullWidth?: boolean;
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
  fullWidth = true,
}: PrimaryButtonProps) {
  const isCreate = variant === "create" || variant === "createGreen";
  const isGreenCreate = variant === "createGreen";

  if (isCreate) {
    const isDisabled = disabled || loading;
    return (
      <TouchableOpacity
        style={[
          createStyles.button,
          isGreenCreate && createStyles.buttonGreen,
          isDisabled && createStyles.buttonDisabled,
          fullWidth && createStyles.fullWidth,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityLabel={accessibilityLabelProp ?? title}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator size="small" color={t.colors.white} />
        ) : (
          <Text style={createStyles.text}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

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
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
});

const createStyles = StyleSheet.create({
  button: {
    height: t.measures.primaryButtonHeight,
    borderRadius: t.radius.cardCreate,
    backgroundColor: t.colors.accentOrangeCreate,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.gridL,
  },
  buttonGreen: {
    backgroundColor: t.colors.accentGreenCreate,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: 17,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: t.colors.white,
  },
});
