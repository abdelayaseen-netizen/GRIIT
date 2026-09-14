import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { DS_COLORS_V2, DS_V3 } from "@/lib/design-system";

export function TaskVerifying({
  line = "Posting your proof…",
}: {
  line?: string;
}) {
  return (
    <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={line}>
      <ActivityIndicator size="large" color={DS_COLORS_V2.brand.primary} />
      <Text style={styles.line}>{line}</Text>
      <Text style={styles.sub}>Nothing is secured until the server says so.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.section,
  },
  line: {
    marginTop: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  sub: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
