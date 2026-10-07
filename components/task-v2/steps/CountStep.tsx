import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import KeyboardDock, { NUMBER_PAD_ACCESSORY_ID, NumberPadDoneBar } from "@/components/ds/KeyboardDock";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ControlPill, { ControlPillRow } from "@/components/ds/ControlPill";
import PushedHeader from "@/components/ds/PushedHeader";
import TextField from "@/components/ds/TextField";
import { parseCountInput, sanitizeCountInput } from "@/lib/keypad-masks";
import {
  COUNT_ADD,
  COUNT_REMOVE,
  COUNT_TYPE,
  countCtaEnabled,
  countCtaLabel,
  countOfLine,
  counterHeaderWhenReady,
  counterSubline,
} from "@/lib/work-step";

type Props = {
  count: number;
  counterGoal: number;
  counterUnit: string;
  taskName: string;
  headerTitle: string;
  headerLabel?: string;
  challengeName?: string;
  currentDay?: number;
  durationDays?: number;
  dayReady?: boolean;
  hasCamera?: boolean;
  keypadOpen: boolean;
  onTypeCount: (v: number) => void;
  onAddOne: () => void;
  onAddAmount?: (n: number) => void;
  onOpenKeypad: () => void;
  onRemoveOne: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

const CIRCLE = DS_V3.size.tap * 3;
const FIGURE = DS_V3.size.tap;

export function CountStep({
  count,
  counterGoal,
  counterUnit,
  taskName,
  headerTitle,
  headerLabel,
  challengeName,
  currentDay = 1,
  durationDays = 1,
  dayReady = true,
  hasCamera = false,
  keypadOpen,
  onTypeCount,
  onAddOne,
  onAddAmount,
  onOpenKeypad,
  onRemoveOne,
  onSubmit,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdOpenedKeypad = useRef(false);
  const enabled = countCtaEnabled(count, counterGoal);
  const line = countOfLine(count, counterGoal, counterUnit);
  const header = counterHeaderWhenReady(
    dayReady,
    challengeName ?? headerLabel ?? "",
    currentDay,
    durationDays,
  );

  return (
    <View style={styles.root}>
      <NumberPadDoneBar />
      <KeyboardDock
        footer={
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
            <Button
              label={countCtaLabel(count, counterGoal)}
              variant="primary"
              disabled={!enabled}
              onPress={onSubmit}
            />
          </View>
        }
      >
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader
          title={header?.title ?? headerTitle}
          label={header?.label ?? headerLabel}
          titleSlot={
            dayReady ? undefined : <View style={styles.daySkeleton} accessibilityLabel="Loading day" />
          }
          onBack={onBack}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text style={styles.honesty}>{counterSubline(hasCamera)}</Text>
        <View style={styles.countLine}>
          <Text style={styles.figure}>{line.n}</Text>
          <Text style={styles.rest}>{line.rest}</Text>
        </View>
        {keypadOpen ? (
          <View style={styles.typeField}>
            <TextField
              label="Count"
              value={count === 0 ? "" : String(count)}
              onChangeText={(t) => {
                const digits = sanitizeCountInput(t);
                onTypeCount(Math.min(counterGoal, parseCountInput(digits)));
              }}
              keyboardType="number-pad"
              inputAccessoryViewID={NUMBER_PAD_ACCESSORY_ID}
              accessibilityLabel="Count"
            />
          </View>
        ) : (
          <>
            <View style={styles.addRow}>
            <Pressable
              onPress={() => {
                if (holdOpenedKeypad.current) return;
                onAddOne();
              }}
              onPressIn={() => {
                holdOpenedKeypad.current = false;
                holdTimer.current = setTimeout(() => {
                  holdOpenedKeypad.current = true;
                  onOpenKeypad();
                }, 450);
              }}
              onPressOut={() => {
                if (holdTimer.current) clearTimeout(holdTimer.current);
              }}
              accessibilityRole="button"
              accessibilityLabel={COUNT_ADD}
              style={styles.addOne}
            >
              <Text style={styles.addOneText}>{COUNT_ADD}</Text>
            </Pressable>
            <View style={styles.bumps}>
              <ControlPill label="+5" onPress={() => onAddAmount?.(5)} />
              <ControlPill label="+10" onPress={() => onAddAmount?.(10)} />
            </View>
            </View>
            <ControlPillRow>
              <ControlPill label={COUNT_REMOVE} icon="minus" onPress={onRemoveOne} />
              <ControlPill label={COUNT_TYPE} icon="keyboard" onPress={onOpenKeypad} />
            </ControlPillRow>
          </>
        )}
      </View>
      </KeyboardDock>
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
    alignItems: "center",
  },
  title: {
    alignSelf: "stretch",
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honesty: {
    alignSelf: "stretch",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  countLine: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  figure: {
    fontSize: FIGURE,
    lineHeight: DS_V3.space.section + DS_V3.space.lg,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  rest: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  typeField: {
    alignSelf: "stretch",
  },
  daySkeleton: {
    width: 140,
    height: 22,
    borderRadius: DS_V3.radius.thumb,
    backgroundColor: DS_V3.color.surface,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  bumps: { gap: DS_V3.space.sm },
  addOne: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  addOneText: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.onBrand,
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
