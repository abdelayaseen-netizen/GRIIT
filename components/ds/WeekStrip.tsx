/**
 * WeekStrip — 01_components.md "WeekStrip" and Motion
 * Laws: 19 (today square fills over 400ms on the same clock as DisplayNumber),
 * 6 (secured days are brand only). Frozen / Last Stand use surface + icon.
 * Not tappable. Max seven squares.
 */
import React, { useEffect } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DS_V3 } from "@/lib/design-system";
import DayCell from "@/components/ds/DayCell";
import { dayCellFromWeekState } from "@/lib/day-cell";
import {
  WEEK_STRIP_WEEKDAYS,
  weekStripAccessibilityLabel,
  type WeekStripDayState,
} from "@/lib/week-strip-days";

const DAY_SECURED_MS = DS_V3.motion.count;
const STROKE = (DS_V3.space.xs * 3) / 8;
export type WeekStripDay = {
  letter: string;
  filled: boolean;
  state?: WeekStripDayState;
};

/** Frame 192. Home and detail 30, sheet 36, profile 20. */
export const STRIP_SIZE = { home: 30, detail: 30, sheet: 36, profile: 20 } as const;

export type WeekStripProps = {
  days: WeekStripDay[];
  todayIndex: number;
  fillToday?: boolean;
  /** Today’s square fill. Default 400ms (Home). Secured screen passes 300. */
  fillMs?: number;
  size?: number;
  onPress?: () => void;
  a11yLabel?: string;
};

function Square({
  letter,
  filled,
  state,
  isToday,
  animateFill,
  fillMs,
  cellSize,
}: {
  letter: string;
  filled: boolean;
  state: WeekStripDayState;
  isToday: boolean;
  animateFill: boolean;
  fillMs: number;
  cellSize: number;
}) {
  const fillProgress = useSharedValue(filled && !animateFill ? 1 : 0);

  useEffect(() => {
    if (!animateFill) {
      fillProgress.value = filled ? 1 : 0;
      return;
    }
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      fillProgress.value = reduce ? 1 : withTiming(1, { duration: fillMs });
    });
  }, [animateFill, filled, fillMs, fillProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      fillProgress.value,
      [0, 1],
      [DS_V3.color.canvas, DS_V3.color.brand]
    ),
  }));

  const letterStyle = [
    styles.letter,
    {
      color: isToday ? DS_V3.color.textPrimary : DS_V3.color.textSecondary,
      fontWeight: isToday ? DS_V3.type.bodyStrong.fontWeight : DS_V3.type.caption.fontWeight,
    },
  ];

  const kind = dayCellFromWeekState(state, isToday);
  const settled = filled && !animateFill;

  return (
    <View style={styles.cell} accessibilityElementsHidden>
      <Text style={letterStyle}>{letter}</Text>
      {animateFill ? (
        <Animated.View
          style={[
            styles.square,
            settled ? styles.squareFilled : styles.squareBorderOnly,
            isToday ? styles.today : null,
            fillStyle,
          ]}
        />
      ) : (
        <DayCell kind={kind} size={cellSize} shape="circle" />
      )}
    </View>
  );
}

export default function WeekStrip({
  days,
  todayIndex,
  fillToday,
  fillMs = DAY_SECURED_MS,
  size = STRIP_SIZE.home,
  onPress,
  a11yLabel,
}: WeekStripProps) {
  const seven = days.slice(0, 7);
  const label =
    a11yLabel ??
    seven
      .map((d, i) => {
        const state = d.state ?? (d.filled ? "secured" : "missed");
        return weekStripAccessibilityLabel(WEEK_STRIP_WEEKDAYS[i] ?? "Monday", state, i === todayIndex);
      })
      .join(". ");
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, { minHeight: DS_V3.size.tap }]}
    >
      {seven.map((d, i) => {
        const state = d.state ?? (d.filled ? "secured" : "missed");
        const brandFilled = state === "secured" || (fillToday === true && i === todayIndex && state === "missed");
        return (
          <Square
            key={`${d.letter}-${i}`}
            letter={d.letter}
            filled={brandFilled}
            state={state}
            isToday={i === todayIndex}
            animateFill={fillToday === true && i === todayIndex && state === "missed"}
            fillMs={fillMs}
            cellSize={size}
          />
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    gap: DS_V3.space.xs,
  },
  letter: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
  },
  square: {
    alignSelf: "stretch",
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
  },
  squareEmpty: {
    backgroundColor: DS_V3.color.border,
  },
  squareBorderOnly: {
    backgroundColor: DS_V3.color.canvas,
  },
  squareFilled: {
    backgroundColor: DS_V3.color.brand,
  },
  squareMarked: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  today: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
});
