/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Check, CheckSquare, Footprints, Hash, Medal, Pencil, Snowflake, Timer } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { homeProofFilled } from "@/lib/home-secured-visuals";
import { dayWord, formatDays } from "@/lib/format-days";
import RootHeader from "@/components/ds/RootHeader";
import HeaderIcon from "@/components/ds/HeaderIcon";
import DisplayNumber from "@/components/ds/DisplayNumber";
import Card from "@/components/ds/Card";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import Stamp from "@/components/ds/Stamp";
import WeekStrip from "@/components/ds/WeekStrip";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import type { FeedScope } from "@/store/feedToggleStore";
import { greetingName } from "@/lib/profile-display";
import { HOME_PROOF_CTA_TODAY, type HomeProofRow } from "@/lib/home-proof-card";

const ICON = DS_V3.space.xs * 6;
const META = DS_V3.space.lg;
const PT = DS_V3.space.xs / 4;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function TypeIcon({ type, color }: { type: string; color: string }) {
  const props = { size: ICON, color, strokeWidth: 2 };
  if (type === "timer") return <Timer {...props} />;
  if (type === "counter") return <Hash {...props} />;
  if (type === "text") return <Pencil {...props} />;
  if (type === "run") return <Footprints {...props} />;
  return <CheckSquare {...props} />;
}

export function greetingTitle(p: {
  display_name?: string | null;
  username?: string | null;
  first_name?: string | null;
}): string | null {
  return greetingName(p);
}

export type HomeV3Proof = {
  challenge: string;
  day: number;
  dayTotal: number;
  taskText: string;
  gate: string;
  doneCount: number;
  totalCount: number;
  posted: boolean;
  hasChallenge: boolean;
  firstProofEver: boolean;
  rows: HomeProofRow[];
  showCta: boolean;
};

export type HomeV3Props = {
  title: string | null;
  streak: number | null;
  streakLine: string;
  proof: HomeV3Proof | null;
  weekFilled: boolean[];
  todayIndex: number;
  fillToday?: boolean;
  feedScope: FeedScope;
  onChangeFeedScope: (s: FeedScope) => void;
  onPressBell: () => void;
  onPressProof: () => void;
  onPressTask?: (id: string) => void;
  awayCount?: number;
  freezesLeft: number;
  badgeName: string;
  badgePct: number;
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
  fillToday,
  feedScope,
  onChangeFeedScope,
  onPressBell,
  onPressProof,
  onPressTask,
  awayCount = 0,
  freezesLeft,
  badgeName,
  badgePct,
  loading,
  error,
  onRetry,
}: HomeV3Props) {
  const weekday = WEEKDAYS[new Date().getDay()] ?? "Sunday";
  const kicker = title ? weekday : undefined;
  const headerTitle = title ?? weekday;
  const secured = homeProofFilled(fillToday === true);
  const days = LETTERS.map((letter, i) => ({
    letter,
    filled: weekFilled[i] === true,
  }));

  if (error) {
    return (
      <View style={[styles.root, styles.pad]}>
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
      <View style={[styles.root, styles.pad]}>
        <Skeleton />
        <View style={styles.gap20} />
        <Skeleton />
        <View style={styles.gap20} />
        <Skeleton />
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
  const proofSub = proof?.hasChallenge ? (
    <Text style={styles.secondary}>
      {proof.challenge} · Day <DisplayNumber value={proof.day} size="inline" /> of {proof.dayTotal}
    </Text>
  ) : (
    <Text style={styles.secondary}>No active challenge</Text>
  );

  return (
    <View style={styles.root}>
      <RootHeader
        kicker={kicker}
        title={headerTitle}
        actions={
          <HeaderIcon accessibilityLabel="Notifications" onPress={onPressBell}>
            <Bell size={ICON} color={DS_V3.color.textPrimary} />
          </HeaderIcon>
        }
      />

      <View style={styles.streak}>
        <Text style={styles.secondary}>Current streak</Text>
        <View
          style={styles.numRow}
          accessibilityLabel={streak == null ? "Streak unavailable" : formatDays(streak)}
        >
          {streak == null ? (
            <Text style={styles.days}>—</Text>
          ) : (
            <>
              <DisplayNumber value={streak} size="home" />
              <Text style={styles.days}>{dayWord(streak)}</Text>
            </>
          )}
        </View>
        <Text style={styles.secondary}>{streakLine}</Text>
      </View>

      {proof ? (
        <View style={styles.gutter}>
          <Card>
            <View style={styles.proofHead}>
              <View style={styles.flex}>
                <Text style={styles.heading}>Today&apos;s proof</Text>
                {proofSub}
              </View>
              <View style={styles.countChip}>
                <Text style={styles.countTxt}>
                  {proof.doneCount} / {proof.totalCount}
                </Text>
              </View>
            </View>
            {proof.rows.map((row) => {
              const closed = row.closed;
              const inner = (
                <>
                  <TypeIcon
                    type={row.type}
                    color={row.done ? DS_V3.color.brandText : DS_V3.color.textSecondary}
                  />
                  <View style={styles.taskCopy}>
                    <Text style={[styles.task, row.done ? styles.taskDone : null]}>{row.name}</Text>
                    <Text style={styles.caption}>{row.caption}</Text>
                  </View>
                  {row.done ? (
                    row.hasCameraProof ? <Stamp label="Complete" /> : <Check size={ICON} color={DS_V3.color.brandText} />
                  ) : null}
                </>
              );
              if (row.done || closed) {
                return (
                  <View
                    key={row.id}
                    style={[styles.proofRow, closed ? styles.proofRowClosed : null]}
                  >
                    {inner}
                  </View>
                );
              }
              return (
                <Pressable
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={row.name}
                  onPress={() => onPressTask?.(row.id)}
                  style={styles.proofRow}
                >
                  {inner}
                </Pressable>
              );
            })}
            {proof.showCta ? (
              <Button label={HOME_PROOF_CTA_TODAY} onPress={onPressProof} />
            ) : null}
          </Card>
        </View>
      ) : null}

      <View style={styles.week}>
        <WeekStrip days={days} todayIndex={todayIndex} fillToday={secured.todaySquareFilled} />
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
  proofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
    marginBottom: DS_V3.space.md,
  },
  proofRowClosed: {
    opacity: 0.55,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.md,
  },
  taskCopy: { flex: 1, gap: DS_V3.space.xs / 2 },
  taskDot: {
    width: DS_V3.space.xs * 6,
    height: DS_V3.space.xs * 6,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
  },
  task: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskDone: {
    color: DS_V3.color.textSecondary,
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
