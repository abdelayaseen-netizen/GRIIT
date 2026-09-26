import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, Shield, Snowflake } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import DisplayNumber from "@/components/ds/DisplayNumber";
import {
  DAY_GLYPH_LABEL,
  HELD_DAY_LINE,
  boardRowsFromDays,
  consistencyDenominatorLine,
  monthGridFromDays,
  weekStripLegendStates,
  type DayRecord,
  type DayState,
  type EnrollmentInput,
} from "@/lib/day-state";
import { securedElapsed } from "@/lib/consistency";

const CELL = 30;
const CELL_R = 6;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SECURED_LINE =
  "A day is secured when every task in every challenge you joined is done. A freeze or a Last Stand holds the streak but is not a secured day.";

export function monthNameFromKey(monthKey: string): string {
  const m = Number(monthKey.slice(5, 7));
  return MONTHS[m - 1] ?? monthKey;
}

export function monthSummaryLabel(secured: number, elapsed: number, monthName: string): string {
  return `${secured} of ${elapsed} days secured in ${monthName}`;
}

export function ofDaysLine(x: number, y: number): string {
  return `${x} of ${y} days`;
}

export function DayCell({
  state,
  size = CELL,
  legend = false,
}: {
  state: DayState;
  size?: number;
  legend?: boolean;
}) {
  const fill =
    state === "camera"
      ? DS_V3.color.brand
      : state === "self"
        ? DS_V3.color.brandTint
        : state === "freeze" || state === "laststand"
          ? DS_V3.color.surface
          : "transparent";
  const border =
    state === "self" || state === "today" || state === "laststand"
      ? DS_V3.color.brand
      : state === "freeze" || state === "missed"
        ? DS_V3.color.border
        : undefined;
  const dashed = state === "today";
  const iconColor =
    state === "camera" ? DS_V3.color.canvas : state === "laststand" ? DS_V3.color.brandText : DS_V3.color.textPrimary;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: fill,
          borderWidth: border ? (state === "laststand" || state === "today" ? 1.5 : 1) : 0,
          borderColor: border ?? "transparent",
          borderStyle: dashed ? "dashed" : "solid",
        },
      ]}
    >
      {state === "camera" ? <Check size={Math.round(size * 0.47)} color={iconColor} strokeWidth={2.4} /> : null}
      {state === "freeze" ? <Snowflake size={Math.round(size * 0.47)} color={iconColor} strokeWidth={2} /> : null}
      {state === "laststand" ? <Shield size={Math.round(size * 0.47)} color={iconColor} strokeWidth={2} /> : null}
      {state === "self" ? <View style={styles.selfDot} /> : null}
      {state === "missed" ? <View style={styles.dash} /> : null}
      {state === "notdue" ? (
        <View style={[styles.notDue, { backgroundColor: legend ? DS_V3.color.textSecondary : DS_V3.color.border }]} />
      ) : null}
    </View>
  );
}

export function ConsistencyGrid({
  days,
  enrollments,
  names,
  joinedLabel,
  monthKey,
  dueDayKeys,
  securedDateKeys,
  todayKey,
}: {
  days: readonly DayRecord[];
  enrollments: readonly EnrollmentInput[];
  names: Record<string, string>;
  joinedLabel: string;
  monthKey: string;
  dueDayKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
}) {
  const { secured, elapsed } = securedElapsed({ dueDayKeys, securedDateKeys, todayKey });
  const month = monthGridFromDays(days, monthKey);
  const monthName = monthNameFromKey(monthKey);
  const legend = weekStripLegendStates(days);
  const boards = boardRowsFromDays(days, enrollments);
  return (
    <View>
      <View style={styles.hero}>
        <DisplayNumber value={secured} size="home" />
        <Text style={styles.ofElapsed}>of {elapsed} days secured</Text>
      </View>
      <Text style={styles.caption}>{consistencyDenominatorLine(joinedLabel)}</Text>
      <Text style={styles.caption}>{SECURED_LINE}</Text>
      <Text style={styles.caption}>{HELD_DAY_LINE}</Text>

      <View
        style={styles.month}
        accessible
        accessibilityLabel={monthSummaryLabel(month.secured, month.elapsed, monthName)}
      >
        <Text style={styles.monthHead}>
          {monthName} · {month.secured} of {month.elapsed} secured
        </Text>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => (
            <Text key={`${d}-${i}`} style={styles.wd}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {Array.from({ length: month.leadingBlanks }, (_, i) => (
            <DayCell key={`b${i}`} state="beforejoin" />
          ))}
          {month.cells.map((d) => (
            <DayCell key={d.dateKey} state={d.state} />
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        {legend.map((s) => (
          <View key={s} style={styles.legendRow}>
            <DayCell state={s} size={18} legend />
            <Text style={styles.caption}>{DAY_GLYPH_LABEL[s]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>By challenge</Text>
      {boards.map((row) => (
        <View key={row.challengeId} style={styles.barRow}>
          <View style={styles.barCopy}>
            <Text style={styles.chName}>{names[row.challengeId] ?? "Challenge"}</Text>
            <Text style={styles.caption}>{ofDaysLine(row.secured, row.elapsed)}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${row.elapsed > 0 ? Math.round((row.secured / row.elapsed) * 100) : 0}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "baseline", gap: DS_V3.space.sm },
  ofElapsed: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, paddingBottom: 9 },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, marginTop: DS_V3.space.sm },
  month: { marginTop: DS_V3.space.section, gap: DS_V3.space.sm },
  monthHead: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  wd: { width: CELL, textAlign: "center", ...DS_V3.type.label, letterSpacing: 0, textTransform: "none", color: DS_V3.color.textSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: {
    borderRadius: CELL_R,
    alignItems: "center",
    justifyContent: "center",
  },
  selfDot: {
    width: 6,
    height: 6,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.brandText,
  },
  dash: { width: 11, height: 1.5, backgroundColor: DS_V3.color.textSecondary },
  notDue: { width: 3, height: 3, borderRadius: DS_V3.radius.pill },
  legend: { marginTop: DS_V3.space.lg, gap: DS_V3.space.sm },
  legendRow: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm },
  label: {
    marginTop: DS_V3.space.section,
    ...DS_V3.type.label,
    color: DS_V3.color.textSecondary,
  },
  barRow: { marginTop: DS_V3.space.md, gap: DS_V3.space.xs },
  barCopy: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  chName: { ...DS_V3.type.secondary, color: DS_V3.color.textPrimary, flex: 1 },
  track: {
    height: 5,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: DS_V3.color.brand },
});
