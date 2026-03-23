import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={s.wrap} accessibilityLabel="Loading state">
      <ActivityIndicator size="large" color={DS_COLORS.ACCENT} />
      <Text style={s.text}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_SPACING.xxl,
  },
  text: {
    marginTop: DS_SPACING.sm,
    color: DS_COLORS.TEXT_SECONDARY,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
  },
});

