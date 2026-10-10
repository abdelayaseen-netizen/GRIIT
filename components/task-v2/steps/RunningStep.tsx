import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ControlPill, { ControlPillRow } from "@/components/ds/ControlPill";
import PushedHeader from "@/components/ds/PushedHeader";
import { clockLabel, fmtMmSs } from "@/lib/task-flow-state";
import {
  TIMER_LEAVING,
  TIMER_PAUSE,
  TIMER_POST_CAPTION,
  TIMER_RESET,
  WORK_POST,
  WORK_SECURED_CAPTION,
  timerClockLine,
  timerPostEnabled,
} from "@/lib/work-step";

type Props = {
  remainingSec: number;
  taskName: string;
  headerTitle: string;
  headerLabel?: string;
  startedAtIso: string | null;
  requiredSeconds: number;
  onPause: () => void;
  onReset: () => void;
  onPost: () => void;
  onBack: () => void;
  footerCaption?: string;
  footerBrand?: boolean;
  submitting?: boolean;
  error?: string | null;
};

const FIGURE = DS_V3.size.shutter + DS_V3.space.xs;

export function RunningStep({
  remainingSec,
  taskName,
  headerTitle,
  headerLabel,
  startedAtIso,
  requiredSeconds,
  onPause,
  onReset,
  onPost,
  onBack,
  footerCaption = WORK_SECURED_CAPTION,
  footerBrand,
  submitting = false,
  error,
}: Props) {
  const insets = useSafeAreaInsets();
  const endsAt = startedAtIso
    ? clockLabel(Date.parse(startedAtIso) + requiredSeconds * 1000)
    : "";
  const ready = timerPostEnabled(remainingSec);
  const rang = useRef(false);
  useEffect(() => {
    if (!ready) {
      rang.current = false;
      return;
    }
    if (rang.current) return;
    rang.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [ready]);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader title={headerTitle} label={headerLabel} onBack={onBack} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text testID={ready ? "timer-times-up" : "timer-ends"} style={styles.label}>
          {timerClockLine(remainingSec, endsAt)}
        </Text>
        <Text style={styles.figure}>{fmtMmSs(remainingSec)}</Text>
        <Text style={styles.leaving}>{TIMER_LEAVING}</Text>
        {ready ? null : (
          <View testID="timer-controls">
            <ControlPillRow>
              <ControlPill label={TIMER_PAUSE} icon="pause" onPress={onPause} />
              <ControlPill label={TIMER_RESET} icon="rotate-ccw" onPress={onReset} />
            </ControlPillRow>
          </View>
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
        <Button
          testID="timer-post"
          label={WORK_POST}
          disabled={!ready}
          submitting={submitting}
          onPress={onPost}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>
          {ready ? footerCaption : TIMER_POST_CAPTION}
        </Text>
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
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  figure: {
    fontSize: FIGURE,
    lineHeight: FIGURE,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  leaving: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
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
    color: DS_V3.color.textPrimary,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
});
