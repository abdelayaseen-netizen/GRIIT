/**
 * v41 ProofsCalendar, wired to the chunk A getRecord days payload.
 * Header count is the one server field — never a reduction over the cells.
 */
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import DayCell from "@/components/ds/DayCell";
import {
  CALENDAR_LEGEND_OWNER,
  CALENDAR_LEGEND_VISITOR,
  NO_DAYS_YET,
  dayCellFromProofsDay,
  leadingBlanksMondayFirst,
  monthTitle,
  type ProofsDayIn,
} from "@/lib/day-cell";
import { calendarHeaderLine, type ProofsHeader } from "@/lib/secured-since";
import DisplayNumber from "@/components/ds/DisplayNumber";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const CELL = 44;
const GAP = 6;

export type ProofsCalendarProps = {
  monthKey: string;
  days: readonly ProofsDayIn[];
  header: ProofsHeader;
  viewer: "owner" | "visitor";
  onDay: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function ProofsCalendar({
  monthKey,
  days,
  header,
  viewer,
  onDay,
  onPrev,
  onNext,
}: ProofsCalendarProps) {
  const byDate = useMemo(() => {
    const map = new Map<string, ProofsDayIn>();
    for (const d of days) {
      if (d.date.startsWith(monthKey)) map.set(d.date, d);
    }
    return map;
  }, [days, monthKey]);

  const last = useMemo(() => {
    const y = Number(monthKey.slice(0, 4));
    const m = Number(monthKey.slice(5, 7));
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
  }, [monthKey]);

  const blanks = leadingBlanksMondayFirst(monthKey);
  const legend = viewer === "owner" ? CALENDAR_LEGEND_OWNER : CALENDAR_LEGEND_VISITOR;
  const empty = days.length === 0 && header.days === 0;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < blanks; i += 1) {
    cells.push(<View key={`b${i}`} style={{ width: CELL, height: CELL }} />);
  }
  for (let d = 1; d <= last; d += 1) {
    const date = `${monthKey}-${String(d).padStart(2, "0")}`;
    const raw = byDate.get(date);
    const model = raw
      ? dayCellFromProofsDay(raw, viewer)
      : { date, kind: date > (days[days.length - 1]?.date ?? date) ? "future" : "before", coverUrl: null, lock: false } as const;
    const tappable = model.kind === "self" || model.kind === "camera" || model.kind === "private" || model.kind === "photo_missing";
    cells.push(
      <DayCell
        key={date}
        kind={model.kind}
        size={CELL}
        coverUrl={model.coverUrl}
        lock={viewer === "owner" && model.lock}
        dateNum={d}
        onPress={tappable ? () => onDay(date) : undefined}
        accessibilityPrefix={`${d}`}
      />,
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <DisplayNumber value={header.secured} size="home" />
        <Text style={styles.of}>{calendarHeaderLine(header)}</Text>
      </View>
      <View style={styles.monthHead}>
        {onPrev ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={onPrev} style={styles.chev}>
            <ChevronLeft size={20} color={DS_V3.color.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.chev} />
        )}
        <Text style={styles.month}>{monthTitle(monthKey)}</Text>
        {onNext ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={onNext} style={styles.chev}>
            <ChevronRight size={20} color={DS_V3.color.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.chev} />
        )}
      </View>
      {empty ? (
        <Text style={styles.empty}>{NO_DAYS_YET}</Text>
      ) : (
        <>
          <View style={styles.wdRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={`${w}-${i}`} style={styles.wd}>
                {w}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>{cells}</View>
          <View style={styles.legend}>
            {legend.map((l) => (
              <Text key={l} style={styles.legendItem}>
                {l}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  hero: { gap: DS_V3.space.xs },
  of: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  monthHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  month: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  chev: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  wdRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 },
  wd: {
    width: CELL,
    textAlign: "center",
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    rowGap: 8,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
    paddingTop: DS_V3.space.sm,
  },
  legendItem: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
