import React from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING } from "@/lib/design-system";

type GRIITWordmarkProps = {
  subtitle?: string;
  color?: string;
  subtitleColor?: string;
  compact?: boolean;
};

/**
 * GRIIT brand wordmark — intentional tracking, bold letterforms, balanced.
 */
export function GRIITWordmark({
  subtitle = "Build Discipline Daily",
  color = DS_COLORS.textPrimary,
  subtitleColor = DS_COLORS.textSecondary,
  compact = false,
}: GRIITWordmarkProps) {
  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <Text
        style={[
          styles.wordmark,
          {
            color,
            fontSize: DS_TYPOGRAPHY.wordmark.fontSize,
            fontWeight: DS_TYPOGRAPHY.wordmark.fontWeight,
            letterSpacing: DS_TYPOGRAPHY.wordmark.letterSpacing,
            lineHeight: DS_TYPOGRAPHY.wordmark.lineHeight,
          },
        ]}
        allowFontScaling={false}
      >
        GRIIT
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: subtitleColor,
              fontSize: DS_TYPOGRAPHY.wordmarkSubtitle.fontSize,
              fontWeight: DS_TYPOGRAPHY.wordmarkSubtitle.fontWeight,
              marginTop: compact ? DS_SPACING.xs : DS_SPACING.sm,
            },
          ]}
          allowFontScaling={false}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: DS_SPACING.sm },
  compactWrap: {},
  wordmark: { ...(Platform.OS === "ios" ? {} : { fontFamily: "sans-serif-medium" }) },
  subtitle: {},
});
