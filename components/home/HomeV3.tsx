/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bell, Camera, Check, Medal, Snowflake } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import RootHeader from "@/components/ds/RootHeader";
import HeaderIcon from "@/components/ds/HeaderIcon";
import DisplayNumber from "@/components/ds/DisplayNumber";
import Card from "@/components/ds/Card";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import WeekStrip from "@/components/ds/WeekStrip";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import type { FeedScope } from "@/store/feedToggleStore";
import { profilePrimaryName } from "@/lib/profile-display";

const ICON = DS_V3.space.xs * 6;
const META = DS_V3.space.lg;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

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

export type HomeV3Proof = {
  challenge: string;
  day: number;
  taskText: string;
  doneCount: number;
  totalCount: number;
  posted: boolean;
};

export type HomeV3Props = {
  title: string;
  streak: number;
  streakLine: string;
  proof: HomeV3Proof | null;
  weekFilled: boolean[];
  todayIndex: number;
  feedScope: FeedScope;
  onChangeFeedScope: (s: FeedScope) => void;
  onPressBell: () => void;
  onPressProof: () => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

export function HomeV3({
  title,
  streak,
  streakLine,
  proof,
  weekFilled,
  todayIndex,
  feedScope,
  onChangeFeedScope,
  onPressBell,
  onPressProof,
  loading,
  error,
  onRetry,
}: HomeV3Props) {
  const kicker = WEEKDAYS[new Date().getDay()] ?? "Sunday";
  const days = LETTERS.map((letter, i) => ({
    letter,
    filled: weekFilled[i] === true,
  }));

  if (error) {
    return (
      <View style={styles.pad}>
        <EmptyState
          heading="Feed did not load"
          body="Check your connection and try again."
          actionLabel="Retry"
          onAction={onRetry}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.pad}>
        <Skeleton />
        <View style={styles.gap20} />
        <Skeleton />
        <View style={styles.gap20} />
        <Skeleton />
      </View>
    );
  }

  return (
    <View>
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
        <View style={styles.numRow}>
          <DisplayNumber value={streak} size="home" />
          <Text style={styles.days}>days</Text>
        </View>
        <Text style={styles.secondary}>{streakLine}</Text>
      </View>

      {proof ? (
        <View style={styles.gutter}>
          <Card>
            <View style={styles.proofHead}>
              <View style={styles.flex}>
                <Text style={styles.heading}>Today&apos;s proof</Text>
                <Text style={styles.secondary}>
                  {proof.challenge} · Day <DisplayNumber value={proof.day} size="inline" />
                </Text>
              </View>
              <View style={styles.countChip}>
                <Text style={styles.countTxt}>
                  {proof.doneCount} / {proof.totalCount}
                </Text>
              </View>
            </View>
            <View style={styles.taskRow}>
              <View style={styles.taskDot} />
              <Text style={styles.task}>{proof.taskText}</Text>
              <Text style={styles.caption}>Photo</Text>
            </View>
            {proof.posted ? (
              <View style={styles.done}>
                <Check size={ICON} color={DS_V3.color.brandText} />
                <Text style={styles.doneTxt}>Posted today</Text>
              </View>
            ) : (
              <Button
                label="Post your first proof"
                icon={<Camera size={ICON} color={DS_V3.color.onBrand} />}
                onPress={onPressProof}
              />
            )}
          </Card>
        </View>
      ) : null}

      <View style={styles.week}>
        <WeekStrip days={days} todayIndex={todayIndex} />
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Snowflake size={META} color={DS_V3.color.brand} />
            <Text style={styles.caption}>1 freeze left</Text>
          </View>
          <View style={styles.metaItem}>
            <Medal size={META} color={DS_V3.color.brand} />
            <Text style={styles.caption}>First badge · 0%</Text>
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

      <Text style={styles.away}>Three friends posted while you were away.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  proofHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
    marginBottom: DS_V3.space.lg,
  },
  flex: { flex: 1, gap: DS_V3.space.xs },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  countChip: {
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.input,
    paddingVertical: DS_V3.space.xs,
    paddingHorizontal: DS_V3.space.md,
  },
  countTxt: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    marginBottom: DS_V3.space.lg,
  },
  taskDot: {
    width: DS_V3.space.xs * 6,
    height: DS_V3.space.xs * 6,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
  },
  task: {
    flex: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  done: {
    minHeight: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.brandTint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
  },
  doneTxt: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
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
  gap20: { height: DS_V3.space.gutter },
});
