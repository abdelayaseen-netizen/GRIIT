/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bell, Medal, Snowflake } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { dayWord, formatDays } from "@/lib/format-days";
import RootHeader from "@/components/ds/RootHeader";
import HeaderIcon from "@/components/ds/HeaderIcon";
import DisplayNumber from "@/components/ds/DisplayNumber";
import Chip from "@/components/ds/Chip";
import WeekStrip from "@/components/shared/WeekStrip";
import TodayCard from "@/components/home/TodayCard";
import type { TodayCardModel } from "@/lib/today-card";
import type { FeedScope } from "@/store/feedToggleStore";
import { profilePrimaryName } from "@/lib/profile-display";
import { NO_ACTIVE_CHALLENGE, TODAY_LOAD_ERROR } from "@/lib/home-today-view";

const ICON = DS_V3.space.xs * 6;
const META = DS_V3.space.lg;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function greetingTitle(p: {
  display_name?: string | null;
  username?: string | null;
}): string {
  const primary = profilePrimaryName(p);
  if (primary) return primary;
  const first = (p.display_name ?? "").trim().split(/\s+/)[0] ?? "";
  if (first) return first;
  const user = (p.username ?? "").trim();
  return user || "GRIIT";
}

export type HomeV3Props = {
  title: string;
  streak: number;
  streakLine: string;
  today: TodayCardModel | null;
  weekFilled: boolean[];
  todayIndex: number;
  fillToday?: boolean;
  feedScope: FeedScope;
  onChangeFeedScope: (s: FeedScope) => void;
  onPressBell: () => void;
  onPressTask: (activeChallengeId: string, taskId: string) => void;
  awayCount: number;
  freezesLeft: number;
  badgeName: string;
  badgePct: number;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
};

export function HomeV3({
  title,
  streak,
  streakLine,
  today,
  weekFilled,
  todayIndex,
  fillToday,
  feedScope,
  onChangeFeedScope,
  onPressBell,
  onPressTask,
  awayCount,
  freezesLeft,
  badgeName,
  badgePct,
  loading,
  empty,
  error,
}: HomeV3Props) {
  const kicker = WEEKDAYS[new Date().getDay()] ?? "Sunday";

  if (error) {
    return (
      <View style={[styles.root, styles.pad]}>
        <Text style={styles.secondary}>{TODAY_LOAD_ERROR}</Text>
      </View>
    );
  }

  const freezeCaption =
    freezesLeft === 1 ? "1 freeze left" : `${freezesLeft} freezes left`;
  const badgeCaption = `${badgeName} · ${badgePct}%`;
  const awayLine =
    awayCount === 0
      ? null
      : `${awayCount} friends posted while you were away.`;

  return (
    <View style={styles.root}>
      <RootHeader
        kicker={kicker}
        title={title}
        actions={
          <HeaderIcon accessibilityLabel="Notifications" onPress={onPressBell}>
            <Bell size={ICON} color={DS_V3.color.textPrimary} />
          </HeaderIcon>
        }
      />

      <View style={styles.streak}>
        <Text style={styles.secondary}>Current streak</Text>
        <View style={styles.numRow} accessibilityLabel={formatDays(streak)}>
          <DisplayNumber value={streak} size="home" />
          <Text style={styles.days}>{dayWord(streak)}</Text>
        </View>
        <Text style={styles.secondary}>{streakLine}</Text>
      </View>

      <View style={styles.gutter}>
        {loading ? (
          <TodayCard model={null} loading onTask={onPressTask} />
        ) : empty ? (
          <Text style={styles.secondary}>{NO_ACTIVE_CHALLENGE}</Text>
        ) : (
          <TodayCard model={today} onTask={onPressTask} />
        )}
      </View>

      <View style={styles.week}>
        <WeekStrip secured={weekFilled} todayIndex={todayIndex} fillToday={fillToday} />
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Snowflake size={META} color={DS_V3.color.brand} />
            <Text style={styles.caption}>{freezeCaption}</Text>
          </View>
          <View style={styles.metaItem}>
            <Medal size={META} color={DS_V3.color.brand} />
            <Text style={styles.caption}>{badgeCaption}</Text>
          </View>
        </View>
      </View>

      <View style={styles.feedHead}>
        <Text style={styles.heading}>Feed</Text>
        <View style={styles.chips}>
          <Chip
            label="Friends"
            selected={feedScope === "following"}
            onPress={() => onChangeFeedScope("following")}
          />
          <Chip
            label="Everyone"
            selected={feedScope === "everyone"}
            onPress={() => onChangeFeedScope("everyone")}
          />
        </View>
      </View>

      {awayLine ? <Text style={styles.away}>{awayLine}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  pad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  streak: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.xs,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  days: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  gutter: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  week: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: DS_V3.space.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  feedHead: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  chips: { flexDirection: "row", gap: DS_V3.space.xs },
  away: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    paddingBottom: DS_V3.space.md,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
