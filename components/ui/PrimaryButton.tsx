import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";

/** Inlined from lib/theme/shadows.ts `shadows.button` — value-preserving migration (Phase 2). */
const PRIMARY_BUTTON_SHADOW_BUTTON = {
  shadowColor: DS_COLORS.shadowBlack,
  shadowOffset: { width: 0, height: 6 } as const,
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 5,
} as const;

/** Inlined from lib/theme/typography.ts `typography.body` — value-preserving migration (Phase 2). */
const THEME_TYPO_BODY = {
  fontSize: 16,
  fontWeight: "500" as const,
  lineHeight: 22,
};

type Variant = "black" | "accent" | "success" | "ghost" | "outline" | "create" | "createGreen";

const HEIGHT = 56;

const variantStyles: Record<Exclude<Variant, "create" | "createGreen">, { bg: string; text: string; border?: string }> = {
  black: { bg: DS_COLORS.black, text: DS_COLORS.white },
  accent: { bg: DS_COLORS.accent, text: DS_COLORS.white },
  success: { bg: DS_COLORS.success, text: DS_COLORS.white },
  ghost: { bg: "transparent", text: DS_COLORS.textPrimary },
  outline: { bg: "transparent", text: DS_COLORS.textPrimary, border: DS_COLORS.border },
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
          <ActivityIndicator size="small" color={DS_COLORS.white} />
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
        !isDisabled && variant !== "ghost" && variant !== "outline" && PRIMARY_BUTTON_SHADOW_BUTTON,
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
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    ...THEME_TYPO_BODY,
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
    height: DS_MEASURES.CTA_HEIGHT,
    borderRadius: DS_RADIUS.card,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.xxl,
  },
  buttonGreen: {
    backgroundColor: DS_COLORS.createChallengeGreen,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: 17,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.white,
  },
});
