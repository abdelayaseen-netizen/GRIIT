/**
 * EmptyState — 01_components.md "EmptyState"
 * Laws: 10 (heading 20, one sentence, one primary button), 18 (errors reuse this),
 * 21 (sits on canvas, never inside a Card).
 * variant "error" is the same component with actionLabel defaulting to Retry
 * (reference States.tsx:25 ErrorState wrapper; spec is one component).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "./Button";

export type EmptyStateVariant = "empty" | "error";

export type EmptyStateProps = {
  icon?: React.ReactNode;
  heading: string;
  body: string;
  actionLabel: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  onRetry?: () => void;
};

export default function EmptyState({
  icon,
  heading,
  body,
  actionLabel,
  onAction,
  variant = "empty",
  onRetry,
}: EmptyStateProps) {
  const press = variant === "error" ? (onRetry ?? onAction) : onAction;

  return (
    <View style={styles.wrap}>
      {icon ? (
        <View style={styles.glyph} accessibilityElementsHidden>
          {icon}
        </View>
      ) : null}
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.action}>
        <Button label={actionLabel} onPress={press} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  glyph: {
    width: DS_V3.size.avatar.md,
    height: DS_V3.size.avatar.md,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    maxWidth: DS_V3.space.xs * 70,
    textAlign: "center",
  },
  action: {
    marginTop: DS_V3.space.sm,
  },
});
