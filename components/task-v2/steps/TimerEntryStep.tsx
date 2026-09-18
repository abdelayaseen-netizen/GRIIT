import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import Switch from "@/components/ds/Switch";
import { fmtMmSs } from "@/lib/task-flow-state";
import {
  TIMER_HONESTY,
  TIMER_LABEL,
  TIMER_MUST_ZERO,
  TIMER_SOUND,
  WORK_SECURED_CAPTION,
  timerStartLabel,
} from "@/lib/work-step";

type Props = {
  taskName: string;
  headerTitle: string;
  requiredSeconds: number;
  soundOn: boolean;
  onSoundOn: (v: boolean) => void;
  onStart: () => void;
  onBack: () => void;
  footerCaption?: string;
  footerBrand?: boolean;
};

const FIGURE = DS_V3.size.shutter + DS_V3.space.xs;

export function TimerEntryStep({
  taskName,
  headerTitle,
  requiredSeconds,
  soundOn,
  onSoundOn,
  onStart,
  onBack,
  footerCaption = WORK_SECURED_CAPTION,
  footerBrand,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader title={headerTitle} onBack={onBack} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text style={styles.honesty}>{TIMER_HONESTY}</Text>
        <Text style={styles.label}>{TIMER_LABEL}</Text>
        <Text style={styles.figure}>{fmtMmSs(requiredSeconds)}</Text>
        <Text style={styles.must}>{TIMER_MUST_ZERO}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{TIMER_SOUND}</Text>
          <Switch value={soundOn} onValueChange={onSoundOn} accessibilityLabel={TIMER_SOUND} />
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
        <Button label={timerStartLabel(requiredSeconds)} onPress={onStart} />
        <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honesty: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.sm,
  },
  figure: {
    fontSize: FIGURE,
    lineHeight: FIGURE,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  must: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  switchLabel: {
    flex: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  captionBrand: {
    color: DS_V3.color.brandText,
  },
});
