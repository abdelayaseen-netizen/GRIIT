/**
 * Simple / manual completion body — controlled, body-only.
 * The TaskShell owns the CTA which fires `onChange({ done: true })`.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCheck } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type TaskSimpleValue = { done: boolean };

export type TaskSimpleBodyProps = {
  value: TaskSimpleValue;
  taskName: string;
};

export function TaskSimpleBody({ value, taskName }: TaskSimpleBodyProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <CheckCheck
            size={40}
            color={DS_COLORS_V2.brand.primary}
            strokeWidth={2}
          />
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.heading}>
          {value.done ? "Confirmed — submitting…" : "Did you complete it?"}
        </Text>
        <Text style={styles.sub}>
          Honor system. Streak depends on you being honest with yourself.
        </Text>
      </View>

      <View style={styles.taskChip}>
        <Text style={styles.taskChipLabel}>TASK</Text>
        <Text style={styles.taskChipName} numberOfLines={3}>
          {taskName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: DS_SPACING_V2.lg,
    gap: DS_SPACING_V2.md,
    alignItems: "center",
  },
  iconWrap: { alignItems: "center", marginTop: DS_SPACING_V2.md },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  copy: { gap: 6, alignItems: "center", paddingHorizontal: DS_SPACING_V2.md },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    lineHeight: 17,
  },
  taskChip: {
    width: "100%",
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderRadius: DS_RADIUS_V2.md,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  taskChipLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
    textTransform: "uppercase",
  },
  taskChipName: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
});

