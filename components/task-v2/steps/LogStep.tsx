import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import type { DistanceUnit } from "@/lib/distance-unit";
import {
  applyDurationFieldChange,
  durationDigitsFromSec,
  formatDurationInput,
  parseDistanceInput,
  parseDurationInput,
  parseMinutesInput,
  sanitizeDistanceInput,
  sanitizeMinutesInput,
} from "@/lib/keypad-masks";
import { logReady } from "@/lib/task-flow-state";
import {
  RUN_PHOTO_AFTER,
  WORK_SECURED_CAPTION,
  WORKOUT_HONESTY,
  WORKOUT_NEXT_PHOTO,
  WORKOUT_USE_TIMER,
  runHonestyLine,
  runPaceLine,
  runPrimaryLabel,
} from "@/lib/work-step";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import TextField from "@/components/ds/TextField";

const CAMERA = DS_V3.space.gutter;

type Props = {
  taskType: string;
  taskName: string;
  headerTitle: string;
  footerCaption?: string;
  footerBrand?: boolean;
  unit: DistanceUnit;
  distance: number | null;
  durationSec: number | null;
  workoutMin: number | null;
  minDurationMinutes: number;
  kind: string;
  onKind: (k: string) => void;
  onDistance: (v: number | null) => void;
  onDuration: (v: number | null) => void;
  onMinutes: (v: number | null) => void;
  onToggleUnit: () => void;
  onUseTimer: () => void;
  onNextPhoto: () => void;
  onPost: () => void;
  onBack: () => void;
  fromGps?: boolean;
  hasCamera?: boolean;
  targetDistance?: number | null;
};

export function LogStep({
  taskType,
  taskName,
  headerTitle,
  footerCaption = WORK_SECURED_CAPTION,
  footerBrand,
  unit,
  distance,
  durationSec,
  workoutMin,
  minDurationMinutes,
  kind,
  onKind,
  onDistance,
  onDuration,
  onMinutes,
  onToggleUnit,
  onUseTimer,
  onNextPhoto,
  onPost,
  onBack,
  fromGps = false,
  hasCamera = true,
  targetDistance = null,
}: Props) {
  const insets = useSafeAreaInsets();
  const ready = logReady({
    taskType,
    distance,
    durationSec,
    workoutMin,
    minDurationMinutes,
  });
  const isRun = taskType === "run";
  const honesty = isRun ? runHonestyLine(fromGps, hasCamera) : WORKOUT_HONESTY;
  const pace = isRun ? runPaceLine(distance, durationSec, unit, targetDistance) : null;
  const cta = isRun ? runPrimaryLabel(hasCamera) : WORKOUT_NEXT_PHOTO;
  const [distanceText, setDistanceText] = useState(distance != null ? String(distance) : "");
  const [durationDigits, setDurationDigits] = useState(
    durationSec != null ? durationDigitsFromSec(durationSec) : "",
  );
  const [minutesText, setMinutesText] = useState(workoutMin != null ? String(workoutMin) : "");
  const lastDuration = useRef<number | null>(durationSec);

  useEffect(() => {
    if (durationSec == null || durationSec === lastDuration.current) return;
    lastDuration.current = durationSec;
    setDurationDigits(durationDigitsFromSec(durationSec));
  }, [durationSec]);

  useEffect(() => {
    if (workoutMin == null) return;
    setMinutesText(String(workoutMin));
  }, [workoutMin]);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader title={headerTitle} onBack={onBack} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text style={styles.honesty}>{honesty}</Text>
        {isRun ? (
          <>
            <View style={styles.fields}>
              <View style={styles.field}>
                <TextField
                  label="Distance"
                  value={distanceText}
                  onChangeText={(t) => {
                    const next = sanitizeDistanceInput(t);
                    setDistanceText(next);
                    onDistance(parseDistanceInput(next));
                  }}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Distance"
                  trailing={
                    <Pressable
                      onPress={onToggleUnit}
                      accessibilityRole="button"
                      accessibilityLabel="Toggle distance unit"
                      hitSlop={DS_V3.space.sm}
                    >
                      <Text style={styles.trail}>{unit}</Text>
                    </Pressable>
                  }
                />
              </View>
              <View style={styles.field}>
                <TextField
                  label="Duration"
                  value={formatDurationInput(durationDigits)}
                  onChangeText={(t) => {
                    const digits = applyDurationFieldChange(durationDigits, t);
                    setDurationDigits(digits);
                    const sec = parseDurationInput(digits);
                    lastDuration.current = sec;
                    onDuration(sec);
                  }}
                  keyboardType="number-pad"
                  accessibilityLabel="Duration"
                  trailing={<Text style={styles.trail}>mm:ss</Text>}
                />
              </View>
            </View>
            {pace ? <Text style={styles.pace}>{pace}</Text> : null}
            {hasCamera ? <Text style={styles.pace}>{RUN_PHOTO_AFTER}</Text> : null}
          </>
        ) : (
          <>
            <TextField
              label="Minutes"
              value={minutesText}
              onChangeText={(t) => {
                const next = sanitizeMinutesInput(t);
                setMinutesText(next);
                onMinutes(parseMinutesInput(next));
              }}
              keyboardType="number-pad"
              accessibilityLabel="Minutes"
              trailing={<Text style={styles.trail}>min</Text>}
            />
            <View style={styles.chips}>
              {["Lift", "Push", "Pull", "Conditioning"].map((k) => (
                <Pressable
                  key={k}
                  onPress={() => onKind(k)}
                  accessibilityRole="button"
                  accessibilityLabel={k}
                  style={[styles.chip, kind === k && styles.chipOn]}
                >
                  <Text style={[styles.chipText, kind === k && styles.chipTextOn]}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Button label={WORKOUT_USE_TIMER} variant="tertiary" flush onPress={onUseTimer} />
          </>
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
        <Button
          label={cta}
          variant="primary"
          disabled={!ready}
          onPress={isRun && !hasCamera ? onPost : onNextPhoto}
          icon={
            isRun && hasCamera ? (
              <Camera size={CAMERA} color={ready ? DS_V3.color.onBrand : DS_V3.color.textSecondary} />
            ) : undefined
          }
        />
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
  fields: {
    flexDirection: "row",
    gap: DS_V3.space.md,
  },
  field: {
    flex: 1,
  },
  trail: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  pace: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  chip: {
    paddingHorizontal: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: DS_V3.space.xs / 4,
    borderColor: DS_V3.color.border,
    justifyContent: "center",
  },
  chipOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderColor: DS_V3.color.brand,
  },
  chipText: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  chipTextOn: {
    color: DS_V3.color.brandText,
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
