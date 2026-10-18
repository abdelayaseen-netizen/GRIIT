import React, { useEffect, useRef, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import {
  LOG_SANITY_MESSAGE,
  LOG_SANITY_TITLE,
  WORKOUT_TYPES,
  logReady,
  runPaceTooFast,
  workoutDistanceField,
  workoutMinimumLine,
} from "@/lib/task-flow-state";
import {
  PARTIAL_ADD_DISTANCE,
  WONT_COUNT_NOTE,
  fmtQty,
  partialLogTotal,
  shortOfGoal,
  shortSaveLabel,
  soFarLine,
} from "@/lib/partial-log";
import {
  RUN_HONESTY_TYPED_NO_CAMERA,
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
const LOG_PAD_ACCESSORY = "log-step-pad-done";

type Props = {
  taskType: string;
  taskName: string;
  headerTitle: string;
  headerLabel?: string;
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
  /** Build 92 03.5: distance already saved today, in the display unit. */
  soFarDistance?: number;
  /** Build 92 03.4: under the goal the footer saves a pending log and keeps the task open. */
  onSaveShort?: () => void;
  saving?: boolean;
};

export function LogStep({
  taskType,
  taskName,
  headerTitle,
  headerLabel,
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
  soFarDistance = 0,
  onSaveShort,
  saving = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const ready = logReady({
    taskType,
    distance,
    durationSec,
    workoutMin,
    minDurationMinutes,
    kind,
  });
  const isRun = taskType === "run";
  const honesty = isRun
    ? runHonestyLine(fromGps, hasCamera)
    : hasCamera
      ? WORKOUT_HONESTY
      : RUN_HONESTY_TYPED_NO_CAMERA;
  const pace = isRun ? runPaceLine(distance, durationSec, unit, null) : null;
  // Build 92 03.3: faster than 3:30 per mile is said inline and Done is off.
  const paceOff = isRun && runPaceTooFast(distance, durationSec, unit);
  // Build 92 03.4/03.5: today's logs add up; under the goal the footer is a short save.
  const total = partialLogTotal(soFarDistance, distance);
  const short =
    isRun && targetDistance != null && distance != null && distance > 0
      ? shortOfGoal(total, targetDistance, unit)
      : null;
  const soFar = isRun && soFarDistance > 0 && targetDistance != null ? soFarLine(soFarDistance, targetDistance, unit, true) : null;
  const cta = short
    ? shortSaveLabel(`${fmtQty(distance ?? 0)} ${unit}`)
    : isRun
      ? runPrimaryLabel(hasCamera)
      : hasCamera
        ? WORKOUT_NEXT_PHOTO
        : runPrimaryLabel(false);
  const onPrimary = short ? (onSaveShort ?? onPost) : hasCamera ? onNextPhoto : onPost;
  const workoutDistance = !isRun && workoutDistanceField(kind) === "optional";
  const minimumLine = isRun ? null : workoutMinimumLine(minDurationMinutes);
  const [distanceText, setDistanceText] = useState(distance != null ? String(distance) : "");
  const [durationDigits, setDurationDigits] = useState(
    durationSec != null ? durationDigitsFromSec(durationSec) : "",
  );
  const [minutesText, setMinutesText] = useState(workoutMin != null ? String(workoutMin) : "");
  const lastDuration = useRef<number | null>(durationSec);
  const padAccessory = Platform.OS === "ios" ? LOG_PAD_ACCESSORY : undefined;

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
    <KeyboardAvoidingView
      style={styles.root}
      behavior="padding"
      keyboardVerticalOffset={insets.top}
    >
      <PushedHeader title={headerTitle} label={headerLabel} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Pressable onPress={Keyboard.dismiss} style={styles.tapAway} accessible={false}>
          <Text style={styles.title}>{taskName}</Text>
          <Text style={styles.honesty}>{honesty}</Text>
          {isRun ? (
            <>
              {soFar ? (
                <Text style={styles.soFar} testID="log-so-far">
                  {soFar}
                </Text>
              ) : null}
              <View style={styles.fields}>
                <View style={styles.field}>
                  <TextField
                    label={soFar ? PARTIAL_ADD_DISTANCE : "Distance"}
                    value={distanceText}
                    onChangeText={(t) => {
                      const next = sanitizeDistanceInput(t);
                      setDistanceText(next);
                      onDistance(parseDistanceInput(next));
                    }}
                    keyboardType="decimal-pad"
                    inputAccessoryViewID={padAccessory}
                    accessibilityLabel="Distance"
                    testID="log-distance"
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
                    inputAccessoryViewID={padAccessory}
                    accessibilityLabel="Duration"
                    testID="log-duration"
                    trailing={
                      <Text style={styles.trail} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                        h:mm:ss
                      </Text>
                    }
                  />
                </View>
              </View>
              {paceOff ? (
                <Text style={styles.paceError} testID="log-pace-error" accessibilityRole="alert">
                  {`${LOG_SANITY_TITLE} ${LOG_SANITY_MESSAGE}`}
                </Text>
              ) : pace ? (
                <Text style={styles.pace}>{pace}</Text>
              ) : null}
              {short && !paceOff ? (
                <View style={styles.shortBlock} testID="log-short">
                  <Text style={styles.shortLine}>{`${short.done} · ${short.short}`}</Text>
                  <Text style={styles.pace}>{WONT_COUNT_NOTE(targetDistance ?? 0, unit)}</Text>
                </View>
              ) : null}
              {hasCamera && !short ? <Text style={styles.pace}>{RUN_PHOTO_AFTER}</Text> : null}
            </>
          ) : (
            <>
              <View style={styles.chips}>
                {WORKOUT_TYPES.map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => {
                      onKind(k);
                      if (workoutDistanceField(k) === "none") {
                        setDistanceText("");
                        onDistance(null);
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={k}
                    accessibilityState={{ selected: kind === k }}
                    style={[styles.chip, kind === k && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, kind === k && styles.chipTextOn]}>{k}</Text>
                  </Pressable>
                ))}
              </View>
              <TextField
                label="Duration"
                value={minutesText}
                onChangeText={(t) => {
                  const next = sanitizeMinutesInput(t);
                  setMinutesText(next);
                  onMinutes(parseMinutesInput(next));
                }}
                keyboardType="number-pad"
                inputAccessoryViewID={padAccessory}
                accessibilityLabel="Duration"
                testID="log-minutes"
                trailing={<Text style={styles.trail}>min</Text>}
              />
              {minimumLine ? <Text style={styles.pace}>{minimumLine}</Text> : null}
              {workoutDistance ? (
                <TextField
                  label="Distance (optional)"
                  value={distanceText}
                  onChangeText={(t) => {
                    const next = sanitizeDistanceInput(t);
                    setDistanceText(next);
                    onDistance(parseDistanceInput(next));
                  }}
                  keyboardType="decimal-pad"
                  inputAccessoryViewID={padAccessory}
                  accessibilityLabel="Distance"
                  testID="log-workout-distance"
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
              ) : null}
              <Button label={WORKOUT_USE_TIMER} variant="tertiary" flush onPress={onUseTimer} />
            </>
          )}
        </Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={cta}
          variant="primary"
          disabled={!ready || paceOff || saving}
          onPress={onPrimary}
          icon={
            isRun && hasCamera && !short ? (
              <Camera size={CAMERA} color={ready ? DS_V3.color.onBrand : DS_V3.color.textSecondary} />
            ) : undefined
          }
        />
        <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
      </View>
      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={LOG_PAD_ACCESSORY}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              accessibilityRole="button"
              accessibilityLabel="Done"
              hitSlop={DS_V3.space.sm}
              style={styles.accessoryHit}
            >
              <Text style={styles.accessoryDone}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
  },
  tapAway: {
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
  paceError: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
  soFar: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  shortBlock: {
    gap: DS_V3.space.xs,
  },
  shortLine: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
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
    backgroundColor: DS_V3.color.surface,
    borderColor: DS_V3.color.textPrimary,
  },
  chipText: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  chipTextOn: {
    color: DS_V3.color.textPrimary,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
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
  accessory: {
    backgroundColor: DS_V3.color.surface,
    borderTopWidth: DS_V3.space.xs / 4,
    borderTopColor: DS_V3.color.border,
    alignItems: "flex-end",
    paddingHorizontal: DS_V3.space.gutter,
  },
  accessoryHit: {
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
  },
  accessoryDone: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
});
