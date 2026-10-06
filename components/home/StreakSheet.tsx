/**
 * Home streak chip sheet. The morning-after FreezeSheet stays on its own copy.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import { DS_V3 } from "@/lib/design-system";
import { FREEZE } from "@/lib/copy";
import { EARNED_FREEZE, nextEarnStreak } from "@/lib/freeze-earn";
import { weekSheetLine } from "@/lib/home-status";
import {
  HELD_DONE,
  NOT_NOW,
  streakSheetFreezeLeft,
  streakSheetMissBody,
  weekdayHeldBody,
  weekdayHeldTitle,
} from "@/lib/v44-detail";

export function StreakSheet({
  visible,
  held,
  weekday,
  streak,
  done,
  total,
  missed,
  freezesLeft,
  freezeCap,
  refill,
  week,
  todayIndex,
  offerFreeze = true,
  submitting,
  error,
  onUse,
  onNotNow,
  onDone,
}: {
  visible: boolean;
  held: boolean;
  weekday: string;
  streak: number;
  done: number;
  total: number;
  missed: string;
  freezesLeft: number;
  freezeCap?: number;
  refill: string;
  week: WeekStripDay[];
  todayIndex: number;
  offerFreeze?: boolean;
  submitting?: boolean;
  error?: string | null;
  onUse: () => void;
  onNotNow: () => void;
  onDone: () => void;
}) {
  if (held) {
    return (
      <Sheet
        visible={visible}
        onDismiss={onDone}
        heading={weekdayHeldTitle(weekday)}
        footer={<Button label={HELD_DONE} onPress={onDone} />}
      >
        <Text style={styles.body}>{weekdayHeldBody(streak, freezesLeft, refill)}</Text>
      </Sheet>
    );
  }
  const line = weekSheetLine(week, todayIndex);
  if (!offerFreeze) {
    return (
      <Sheet visible={visible} onDismiss={onNotNow} heading={String(streak)}>
        <WeekStrip days={week} todayIndex={todayIndex} size={36} />
        {line ? <Text style={styles.body}>{line}</Text> : null}
      </Sheet>
    );
  }
  return (
    <Sheet
      visible={visible}
      onDismiss={onNotNow}
      heading={String(streak)}
      footer={
        <>
          <Button label={FREEZE.button} onPress={onUse} submitting={submitting} />
          <Button label={NOT_NOW} variant="tertiary" onPress={onNotNow} />
        </>
      }
    >
      <WeekStrip days={week} todayIndex={todayIndex} size={36} />
      {line ? <Text style={styles.body}>{line}</Text> : null}
      <View style={styles.block}>
        <Text style={styles.title}>{FREEZE.title(weekday)}</Text>
        <Text style={styles.body}>
          {streakSheetMissBody({ done, total, missed, weekday, streak })}
        </Text>
        <Text style={styles.body}>{streakSheetFreezeLeft(freezesLeft, refill)}</Text>
        {freezeCap != null ? (
          <Text style={styles.body}>
            {EARNED_FREEZE.ofCap(freezesLeft, freezeCap)}
            {"\n"}
            {EARNED_FREEZE.nextAt(nextEarnStreak(streak))}
          </Text>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8, marginTop: 12 },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    color: DS_V3.color.textSecondary,
  },
  error: { marginTop: 8, color: DS_V3.color.textPrimary, fontSize: 13 },
});
