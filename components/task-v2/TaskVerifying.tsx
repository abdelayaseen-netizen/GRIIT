import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Spinner from "@/components/ds/Spinner";
import { SAVING_TAKEOVER_HEADING, SIMPLE_ASK_CAPTION } from "@/lib/simple-log";

export function TaskVerifying({
  line = SAVING_TAKEOVER_HEADING,
}: {
  line?: string;
}) {
  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityLabel={line}
    >
      <Spinner size={44} />
      <Text style={styles.heading}>{SAVING_TAKEOVER_HEADING}</Text>
      <Text style={styles.sentence}>{SIMPLE_ASK_CAPTION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  sentence: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
