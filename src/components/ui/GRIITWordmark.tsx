import React from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING } from "@/lib/design-system";

type GRIITWordmarkProps = {
  subtitle?: string;
  color?: string;
  subtitleColor?: string;
  compact?: boolean;
  spaced?: boolean;
};

export function GRIITWordmark({
  subtitle = "Build Discipline Daily",
  color,
  subtitleColor,
  compact = false,
  spaced: _spaced = false,
}: GRIITWordmarkProps) {
  const textColor = color || DS_COLORS.TEXT_PRIMARY;
  const subColor = subtitleColor || DS_COLORS.TEXT_SECONDARY;

  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <Text
        style={[
          styles.wordmark,
          {
            color: textColor,
            fontSize: DS_TYPOGRAPHY.SIZE_2XL,
            fontWeight: DS_TYPOGRAPHY.WEIGHT_BLACK,
            letterSpacing: -0.5,
            lineHeight: DS_TYPOGRAPHY.SIZE_2XL * DS_TYPOGRAPHY.LINE_TIGHT,
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
              color: subColor,
              fontSize: DS_TYPOGRAPHY.SIZE_SM,
              fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR,
              marginTop: compact ? DS_SPACING.XS : DS_SPACING.SM,
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
  wrap: { marginTop: DS_SPACING.SM },
  compactWrap: {},
  wordmark: { ...(Platform.OS === "ios" ? {} : { fontFamily: "sans-serif-medium" }) },
  subtitle: {},
});
