import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ControlPill, { ControlPillRow } from "@/components/ds/ControlPill";
import PushedHeader from "@/components/ds/PushedHeader";
import { clockLabel, fmtMmSs } from "@/lib/task-flow-state";
import {
  TIMER_FINISH_EARLY,
  TIMER_LEAVING,
  TIMER_PAUSE,
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
  dayReady?: boolean;
  startedAtIso: string | null;
  requiredSeconds: number;
  onPause: () => void;
  onReset: () => void;
  onPost: () => void;
  onFinishEarly: () => void;
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
  dayReady = true,
  startedAtIso,
  requiredSeconds,
  onPause,
  onReset,
  onPost,
  onFinishEarly,
  onBack,
  footerCaption = WORK_SECURED_CAPTION,
  footerBrand,
  submitting = false,
  error,
}: Props) {
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
  // Done stays tappable while the timer runs — confirms "Finished early?"

  return (
    <View style={styles.root}>
      <View>
        <PushedHeader
          title={headerTitle}
          label={headerLabel}
          titleSlot={dayReady ? undefined : <View style={styles.daySkeleton} accessibilityLabel="Loading day" />}
          onBack={onBack}
        />
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
      <View style={styles.footer}>
        <Button
          testID="timer-finish-early"
          label={TIMER_FINISH_EARLY}
          variant="secondary"
          submitting={submitting}
          onPress={onFinishEarly}
        />
        <Button
          testID="timer-post"
          label={WORK_POST}
          submitting={submitting}
          onPress={onPost}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {ready ? (
          <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daySkeleton: {
    width: 140,
    height: 22,
    borderRadius: DS_V3.radius.thumb,
    backgroundColor: DS_V3.color.surface,
  },
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
    paddingBottom: DS_V3.space.gutter,
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
