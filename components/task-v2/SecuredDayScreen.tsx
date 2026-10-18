/**
 * Build 92 02.3 · Day secured (P1-06 … P1-09). Fits an iPhone SE with no scroll.
 * Order: the streak number, "Every task today is done.", the week strip, the tasks, then
 * Share (primary) and Done. Done, Back and swipe-down all go Home. The teaching line shows once.
 */
import React, { useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Flame, Snowflake } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, GLASS_STATE } from "@/lib/glass";
import { FloatingActionBar } from "@/components/ds/glass/FloatingActionBar";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import EmptyState from "@/components/ds/EmptyState";
import { FINISH_COPY, inARow } from "@/lib/finish-flow";
import { SECURED_LOAD_ERROR, SECURED_LOAD_RETRY } from "@/lib/secured-day";

export type SecuredTaskRow = {
  id: string;
  title: string;
  /** "Verified", "Verified by Strava" or "Self-reported". */
  label: string;
  /** The proof photo for camera tasks; self-reported rows show no placeholder. */
  photoUri?: string | null;
};

type Props = {
  streak: number;
  week: WeekStripDay[];
  todayIndex: number;
  fillToday?: boolean;
  tasks: SecuredTaskRow[];
  /** The teaching line, first secured day only. */
  firstTime: boolean;
  freezeNote?: string | null;
  loadError?: boolean;
  onRetryLoad?: () => void;
  sharing?: boolean;
  onShare: () => void;
  /** Done, Back and swipe-down. */
  onDone: () => void;
};

const SWIPE_HOME_PT = 64;
const ROW_H = 44;
const MAX_ROWS = 4;

export default function SecuredDayScreen({
  streak,
  week,
  todayIndex,
  fillToday,
  tasks,
  firstTime,
  freezeNote,
  loadError,
  onRetryLoad,
  sharing = false,
  onShare,
  onDone,
}: Props) {
  const insets = useSafeAreaInsets();
  const drag = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) drag.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > SWIPE_HOME_PT) {
          drag.setValue(0);
          onDone();
        } else {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;
  const shown = tasks.slice(0, MAX_ROWS);
  const more = tasks.length - shown.length;

  return (
    <Animated.View
      style={[styles.root, { paddingTop: insets.top, transform: [{ translateY: drag }] }]}
      testID="day-secured"
      {...pan.panHandlers}
    >
      <View style={styles.topRow}>
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
          hitSlop={8}
          testID="day-secured-back"
        >
          <ChevronLeft size={24} color={DS_V3.color.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.hero} accessible accessibilityLabel={`${streak} ${inARow(streak)}`}>
        <View style={styles.streakRow}>
          <Flame size={36} color={DS_V3.color.brand} fill={DS_V3.color.brand} />
          <Text style={styles.streak} testID="day-secured-streak">
            {streak}
          </Text>
        </View>
        <Text style={styles.inARow}>{inARow(streak)}</Text>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {FINISH_COPY.secured}
      </Text>

      <View style={styles.week}>
        <WeekStrip days={week} todayIndex={todayIndex} fillToday={fillToday} fillMs={300} size={32} />
      </View>

      <View style={styles.tasks} testID="day-secured-tasks">
        {loadError ? (
          <EmptyState variant="error" heading={SECURED_LOAD_ERROR} body="" actionLabel={SECURED_LOAD_RETRY} onAction={onRetryLoad} />
        ) : (
          shown.map((t, i) => (
            <View key={t.id} style={[styles.row, i > 0 && styles.rowDivider]}>
              {t.photoUri ? <Image source={{ uri: t.photoUri }} style={styles.thumb} contentFit="cover" /> : null}
              <Text style={styles.rowTitle} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={styles.rowLabel}>{t.label}</Text>
            </View>
          ))
        )}
        {more > 0 ? <Text style={styles.more}>{`+${more} more`}</Text> : null}
      </View>

      {firstTime ? (
        <Text style={styles.teaching} testID="day-secured-teaching">
          {FINISH_COPY.securedFirst}
        </Text>
      ) : null}
      {freezeNote ? (
        <View style={styles.freezeNote}>
          <Snowflake size={14} color={DS_V3.color.textSecondary} />
          <Text style={styles.caption}>{freezeNote}</Text>
        </View>
      ) : null}

      <FloatingActionBar
        primary={FINISH_COPY.share}
        onPrimary={onShare}
        secondary={FINISH_COPY.done}
        onSecondary={onDone}
        loading={sharing}
        loadingLabel={FINISH_COPY.share}
        testID="day-secured-actions"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    paddingHorizontal: DS_V3.space.gutter,
  },
  topRow: { height: 44, justifyContent: "center" },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -10 },
  hero: { alignItems: "center", marginTop: DS_V3.space.xs },
  streakRow: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.xs },
  streak: {
    fontSize: DS_V3.type.number.fontSize,
    lineHeight: DS_V3.type.number.lineHeight,
    fontWeight: DS_V3.type.number.fontWeight,
    letterSpacing: DS_V3.type.number.letterSpacing,
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  inARow: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  title: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
    marginTop: DS_V3.space.sm,
  },
  week: { marginTop: DS_V3.space.md, alignItems: "center" },
  tasks: {
    marginTop: DS_V3.space.md,
    borderRadius: DS_V3.radius.card,
    backgroundColor: DS_V3.color.surface,
    paddingHorizontal: DS_V3.space.md,
  },
  row: {
    minHeight: ROW_H,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: GLASS_STATE.rowDivider },
  thumb: { width: 32, height: 32, borderRadius: GLASS_RADIUS.rowIcon / 2, backgroundColor: DS_V3.color.border },
  rowTitle: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  rowLabel: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textSecondary,
  },
  more: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    paddingVertical: DS_V3.space.xs,
  },
  teaching: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
    marginTop: DS_V3.space.sm,
  },
  freezeNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.xs,
    marginTop: DS_V3.space.xs,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});
