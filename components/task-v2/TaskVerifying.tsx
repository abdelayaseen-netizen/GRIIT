import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";

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
    backgroundColor: DS_COLORS_V2.surface.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  line: { marginTop: 18, fontSize: 15, color: DS_COLORS_V2.text.body, textAlign: "center" },
  sub: { marginTop: 8, fontSize: 13, color: DS_COLORS_V2.text.mutedWarm, textAlign: "center" },
});
