/**
 * Home streak chip sheet. The morning-after FreezeSheet stays on its own copy.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import { DS_V3 } from "@/lib/design-system";
import { FREEZE, FREEZE_LINE } from "@/lib/copy";
import { EARNED_FREEZE, nextEarnStreak } from "@/lib/freeze-earn";
import { weekSheetLine } from "@/lib/home-status";
import {
  HELD_DONE,
  NOT_NOW,
  weekdayHeldBody,
  weekdayHeldTitle,
} from "@/lib/v44-detail";

export function StreakSheet({
  visible,
  held,
  weekday,
  streak,
  done: _done,
  total: _total,
  missed: _missed,
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
          <Button label={FREEZE.button} variant="secondary" onPress={onUse} submitting={submitting} />
          <Pressable accessibilityRole="button" accessibilityLabel={NOT_NOW} onPress={onNotNow}>
            <Text style={styles.notNow}>{NOT_NOW}</Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.hero}>
        <Flame size={28} color={DS_V3.color.brand} />
        <Text style={styles.heroNum}>{streak}</Text>
      </View>
      <WeekStrip days={week} todayIndex={todayIndex} size={36} />
      {line ? <Text style={styles.body}>{line}</Text> : null}
      <View style={styles.block}>
        <Text style={styles.label}>Freezes</Text>
        <Text style={styles.body}>
          {EARNED_FREEZE.ofCap(freezesLeft, freezeCap ?? 2)} · {EARNED_FREEZE.nextAt(nextEarnStreak(streak))}
        </Text>
        <Text style={styles.body}>{FREEZE_LINE}</Text>
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
  hero: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroNum: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: DS_V3.color.textPrimary,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: DS_V3.color.textSecondary,
  },
  notNow: {
    minHeight: 44,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    color: DS_V3.color.textPrimary,
  },
});
