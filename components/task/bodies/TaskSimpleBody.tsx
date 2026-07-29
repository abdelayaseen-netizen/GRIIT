/**
 * Simple Ask — self-report only. No gates, no camera, no verifying fiction.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  DS_COLORS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { SIMPLE_ASK_HEADING, SIMPLE_ASK_INFO } from "@/lib/simple-log";

export type TaskSimpleBodyProps = {
  /** Optional task title shown quietly under the info line. */
  taskName?: string;
};

export function TaskSimpleBody({ taskName }: TaskSimpleBodyProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{SIMPLE_ASK_HEADING}</Text>
      <Text style={styles.info}>{SIMPLE_ASK_INFO}</Text>
      {taskName?.trim() ? (
        <Text style={styles.taskName} numberOfLines={3}>
          {taskName.trim()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: DS_SPACING_V2.xl,
    gap: DS_SPACING_V2.sm,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 34,
    paddingHorizontal: DS_SPACING_V2.md,
  },
  info: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: DS_SPACING_V2.lg,
  },
  taskName: {
    marginTop: DS_SPACING_V2.md,
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    paddingHorizontal: DS_SPACING_V2.md,
  },
});
