/**
 * Wizard header and pinned footer — 01_components.md WizardHeader, law 8.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { Button } from "@/components/ds";

const PT = DS_V3.space.xs / 4;

export function WizardHeader({
  step,
  total,
  onCancel,
}: {
  step: 1 | 2 | 3;
  total: 3;
  onCancel: () => void;
}) {
  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.side}>
          <Button label="Cancel" variant="tertiary" size="small" flush onPress={onCancel} />
        </View>
        <Text style={styles.stepLabel}>{`Step ${step} of ${total}`}</Text>
        <View style={styles.side} />
      </View>
      <View style={styles.progress}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.track, i < step ? styles.trackOn : styles.trackOff]}
          />
        ))}
      </View>
    </View>
  );
}

export function WizardFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    height: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: {
    width: DS_V3.space.xs * 14,
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
  },
  stepLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  progress: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  track: {
    flex: 1,
    height: DS_V3.space.xs,
    borderRadius: DS_V3.radius.input,
  },
  trackOn: { backgroundColor: DS_V3.color.brand },
  trackOff: { backgroundColor: DS_V3.color.border },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
    backgroundColor: DS_V3.color.canvas,
    borderTopWidth: PT,
    borderTopColor: DS_V3.color.border,
  },
});
