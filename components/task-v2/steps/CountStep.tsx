import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import { type KeypadMask } from "@/lib/keypad-masks";
import { TaskKeypad } from "../TaskKeypad";
import {
  COUNT_ADD,
  COUNT_HONESTY,
  COUNT_REMOVE,
  COUNT_TYPE,
  WORK_SECURED_CAPTION,
  countCtaEnabled,
  countCtaLabel,
  countOfLine,
} from "@/lib/work-step";

type Props = {
  count: number;
  counterGoal: number;
  counterUnit: string;
  taskName: string;
  headerTitle: string;
  footerCaption?: string;
  footerBrand?: boolean;
  keypadOpen: boolean;
  buffer: string;
  onBuffer: (v: string) => void;
  onKeypadDone: (v: number | null) => void;
  onAddOne: () => void;
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
  footerCaption = WORK_SECURED_CAPTION,
  footerBrand,
  keypadOpen,
  buffer,
  onBuffer,
  onKeypadDone,
  onAddOne,
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

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader title={headerTitle} onBack={onBack} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text style={styles.honesty}>{COUNT_HONESTY}</Text>
        <View style={styles.countLine}>
          <Text style={styles.figure}>{line.n}</Text>
          <Text style={styles.rest}>{line.rest}</Text>
        </View>
        {keypadOpen ? (
          <TaskKeypad
            label="Count"
            mask={"count" as KeypadMask}
            buffer={buffer}
            onBuffer={onBuffer}
            onDone={onKeypadDone}
          />
        ) : (
          <>
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
            <Button label={COUNT_REMOVE} variant="tertiary" flush onPress={onRemoveOne} />
            <Button label={COUNT_TYPE} variant="tertiary" flush onPress={onOpenKeypad} />
          </>
        )}
      </View>
      {keypadOpen ? null : (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
          <Button
            label={countCtaLabel(count, counterGoal)}
            variant="primary"
            disabled={!enabled}
            onPress={onSubmit}
          />
          <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
        </View>
      )}
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
  addOne: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.primary,
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
