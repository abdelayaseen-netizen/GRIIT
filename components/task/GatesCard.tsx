/**
 * GatesCard — Ready-state GATES card for task-states-v2.
 *
 * Status chip ("● In window" / "● Out of window") is derived from
 * `evaluateScheduleWindow` — never a prop default. Gate rows render only
 * what the parent passes (honest cut: only configured gates appear).
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { evaluateScheduleWindow } from "@/lib/schedule-window";

export type GatesCardGate = {
  key: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
};

export type GatesCardProps = {
  /** HH:mm from task config — drives the live status chip. */
  scheduleWindowStart?: string | null;
  scheduleWindowEnd?: string | null;
  scheduleTimezone?: string | null;
  /** Only gates that apply for this task type/config. */
  gates: GatesCardGate[];
  /** Injectable clock for tests. Defaults to live Date + 30s tick. */
  now?: Date;
};

export function GatesCard({
  scheduleWindowStart,
  scheduleWindowEnd,
  scheduleTimezone,
  gates,
  now: nowProp,
}: GatesCardProps) {
  const [tickNow, setTickNow] = useState(() => nowProp ?? new Date());

  useEffect(() => {
    if (nowProp) {
      setTickNow(nowProp);
      return;
    }
    const id = setInterval(() => setTickNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [nowProp]);

  const evaluation = evaluateScheduleWindow({
    start: scheduleWindowStart,
    end: scheduleWindowEnd,
    timeZone: scheduleTimezone,
    now: tickNow,
  });

  const chipInWindow = evaluation.status === "in_window";
  const showChip = evaluation.chipLabel != null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.gatesLabel}>GATES</Text>
        {showChip ? (
          <View
            style={styles.chip}
            accessibilityLabel={evaluation.chipLabel ?? undefined}
          >
            <View
              style={[
                styles.chipDot,
                {
                  backgroundColor: chipInWindow
                    ? DS_COLORS_V2.semantic.success
                    : DS_COLORS_V2.semantic.danger,
                },
              ]}
            />
            <Text
              style={[
                styles.chipText,
                {
                  color: chipInWindow
                    ? DS_COLORS_V2.semantic.success
                    : DS_COLORS_V2.semantic.danger,
                },
              ]}
            >
              {evaluation.chipLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {gates.map((gate) => (
        <View key={gate.key} style={styles.gateRow}>
          {gate.icon ? <View style={styles.gateIcon}>{gate.icon}</View> : null}
          <View style={styles.gateTextCol}>
            <Text style={styles.gateLabel}>{gate.label}</Text>
            {gate.sublabel ? (
              <Text style={styles.gateSublabel}>{gate.sublabel}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING_V2.xs,
  },
  gatesLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    color: DS_COLORS_V2.text.tertiary,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  gateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING_V2.sm,
    paddingVertical: 6,
  },
  gateIcon: {
    marginTop: 2,
  },
  gateTextCol: {
    flex: 1,
    gap: 2,
  },
  gateLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  gateSublabel: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
});
