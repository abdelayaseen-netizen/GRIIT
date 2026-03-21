import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { AlertCircle, X } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

interface InlineErrorProps {
  message: string | null;
  onDismiss?: () => void;
  variant?: "error" | "warning" | "success";
  autoDismissMs?: number;
}

const VARIANT_STYLES = {
  error: {
    bg: DS_COLORS.DANGER_BG,
    border: DS_COLORS.alertRedBorder,
    text: DS_COLORS.dangerDarkest,
    icon: DS_COLORS.DANGER,
  },
  warning: {
    bg: DS_COLORS.amberLightBg,
    border: DS_COLORS.WARNING,
    text: DS_COLORS.amberDarkText,
    icon: DS_COLORS.WARNING,
  },
  success: {
    bg: DS_COLORS.GREEN_BG,
    border: DS_COLORS.COMPLETED_BORDER,
    text: DS_COLORS.emeraldDark,
    icon: DS_COLORS.GREEN,
  },
} as const;

export function InlineError({ message, onDismiss, variant = "error", autoDismissMs }: InlineErrorProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      if (autoDismissMs && onDismiss) {
        const timer = setTimeout(onDismiss, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [message, autoDismissMs, onDismiss, opacity]);

  if (!message) return null;

  const colors = VARIANT_STYLES[variant];

  return (
    <Animated.View
      style={[styles.container, { opacity, backgroundColor: colors.bg, borderColor: colors.border }]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <AlertCircle size={18} color={colors.icon} />
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss error" hitSlop={8} accessibilityRole="button">
          <X size={16} color={colors.text} />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: DS_SPACING.md,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    marginBottom: DS_SPACING.md,
    gap: DS_SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    lineHeight: DS_TYPOGRAPHY.SIZE_SM * 1.4,
  },
});
