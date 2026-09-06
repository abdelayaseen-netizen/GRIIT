/**
 * WeekStrip — 01_components.md "WeekStrip" and Motion
 * Laws: 19 (today square fills over 400ms on the same clock as DisplayNumber),
 * 6 (filled days are brand only). Not tappable. Max seven squares.
 */
import React, { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DS_V3 } from "@/lib/design-system";

const DAY_SECURED_MS = DS_V3.motion.count;
const STROKE = (DS_V3.space.xs * 3) / 8;

export type WeekStripDay = {
  letter: string;
  filled: boolean;
};

export type WeekStripProps = {
  days: WeekStripDay[];
  todayIndex: number;
  fillToday?: boolean;
};

function Square({
  letter,
  filled,
  isToday,
  animateFill,
}: {
  letter: string;
  filled: boolean;
  isToday: boolean;
  animateFill: boolean;
}) {
  const progress = useSharedValue(filled && !animateFill ? 1 : 0);

  useEffect(() => {
    if (!animateFill) {
      progress.value = filled ? 1 : 0;
      return;
    }
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      progress.value = reduce ? 1 : withTiming(1, { duration: DAY_SECURED_MS });
    });
  }, [animateFill, filled, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [DS_V3.color.border, DS_V3.color.brand]
    ),
  }));

  const settled = filled && !animateFill;

  return (
    <View style={styles.cell}>
      <Text
        style={[
          styles.letter,
          {
            color: isToday ? DS_V3.color.textPrimary : DS_V3.color.textSecondary,
            fontWeight: isToday ? DS_V3.type.bodyStrong.fontWeight : DS_V3.type.caption.fontWeight,
          },
        ]}
      >
        {letter}
      </Text>
      <Animated.View
        style={[
          styles.square,
          settled ? styles.squareFilled : styles.squareEmpty,
          isToday ? styles.today : null,
          animateFill || !settled ? fillStyle : null,
        ]}
      />
    </View>
  );
}

export default function WeekStrip({
  days,
  todayIndex,
  fillToday,
}: WeekStripProps) {
  const seven = days.slice(0, 7);
  return (
    <View style={styles.row} accessibilityLabel="Week">
      {seven.map((d, i) => (
        <Square
          key={`${d.letter}-${i}`}
          letter={d.letter}
          filled={d.filled || (fillToday === true && i === todayIndex)}
          isToday={i === todayIndex}
          animateFill={fillToday === true && i === todayIndex && !d.filled}
        />
      ))}
    </View>
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
  squareFilled: {
    backgroundColor: DS_V3.color.brand,
  },
  today: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
});
