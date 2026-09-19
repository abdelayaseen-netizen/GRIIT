/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Check, ChevronDown, ChevronRight, ChevronUp, Medal, Snowflake, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { homeProofFilled } from "@/lib/home-secured-visuals";
import { dayWord, formatDays } from "@/lib/format-days";
import RootHeader from "@/components/ds/RootHeader";
import HeaderIcon from "@/components/ds/HeaderIcon";
import DisplayNumber from "@/components/ds/DisplayNumber";
import Card from "@/components/ds/Card";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import Divider from "@/components/ds/Divider";
import WeekStrip from "@/components/ds/WeekStrip";
import type { WeekStripDayState } from "@/lib/week-strip-days";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import type { FeedScope } from "@/store/feedToggleStore";
import { greetingName } from "@/lib/profile-display";
import {
  HOME_PROOF_HEADING,
  homeProofDayLine,
  homeProofRingState,
  homeProofTitleMuted,
  type HomeProofCard,
  type HomeProofRow,
} from "@/lib/home-proof-card";
import { friendsPostedAwayLine } from "@/lib/home-away-count";
import { USE_FREEZE_FOR_YESTERDAY, YESTERDAY_WASNT_SECURED } from "@/lib/morning-after";
import { todaySectionExpanded } from "@/lib/today-section-collapse";

const ICON = DS_V3.space.xs * 6;
const RING = DS_V3.space.gutter;
const RING_CHECK = DS_V3.space.md;
const META = DS_V3.space.lg;
const STROKE = (DS_V3.space.xs * 3) / 8;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function StatusRing({ row }: { row: HomeProofRow }) {
  const state = homeProofRingState(row);
  if (state === "done") {
    return (
      <View style={[styles.ring, styles.ringDone]} accessibilityLabel="Done">
        <Check size={RING_CHECK} color={DS_V3.color.canvas} strokeWidth={2.5} />
      </View>
    );
  }
  return (
    <View
      style={[styles.ring, state === "closed" ? styles.ringClosed : styles.ringPending]}
      accessibilityLabel={state === "closed" ? "Window closed" : "Pending"}
    />
  );
}

export function greetingTitle(p: {
  display_name?: string | null;
  username?: string | null;
  first_name?: string | null;
}): string | null {
  return greetingName(p);
}

export type HomeV3Proof = HomeProofCard;

export type HomeV3MorningAfter = {
  cost: string;
  cushion: string;
  freezeCaption?: string | null;
  onDismiss: () => void;
  onUseFreeze?: () => void;
};

export type HomeV3Props = {
  title: string | null;
  streak: number | null;
  streakLine: string;
  morningAfter?: HomeV3MorningAfter | null;
  proof: HomeV3Proof | null;
  weekFilled?: boolean[];
  weekStates?: WeekStripDayState[];
  todayIndex: number;
  fillToday?: boolean;
  feedScope: FeedScope;
  onChangeFeedScope: (s: FeedScope) => void;
  onPressBell: () => void;
  onPressProof: () => void;
  onPressTask?: (id: string) => void;
  onPressChallenge?: (challengeId: string) => void;
  sectionChoices?: Record<string, boolean | undefined>;
  onToggleSection?: (sectionId: string, expanded: boolean) => void;
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
  morningAfter,
  proof,
  weekFilled,
  weekStates,
  todayIndex,
  fillToday,
  feedScope,
  onChangeFeedScope,
  onPressBell,
  onPressProof: _onPressProof,
  onPressTask,
  onPressChallenge,
  sectionChoices,
  onToggleSection,
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
  const days = LETTERS.map((letter, i) => {
    const state = weekStates?.[i] ?? (weekFilled?.[i] === true ? "secured" : "missed");
    return {
      letter,
      filled: state === "secured",
      state,
    };
  });

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
  const awayLine = friendsPostedAwayLine(awayCount);
  const renderRow = (row: HomeProofRow) => {
    const closed = row.closed;
    const pending = !row.done && !closed;
    const inner = (
      <>
        <StatusRing row={row} />
        <View style={styles.taskCopy}>
          <Text style={[styles.task, homeProofTitleMuted(row) ? styles.taskMuted : null]}>{row.name}</Text>
          <Text style={styles.caption}>{row.caption}</Text>
        </View>
        {pending ? (
          <ChevronRight size={RING} color={DS_V3.color.textSecondary} accessibilityLabel="Open" />
        ) : null}
      </>
    );
    if (!pending) {
      return (
        <View key={row.id} style={styles.proofRow}>
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
  };

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

      {morningAfter ? (
        <View style={styles.gutter}>
          <Card>
            <View style={styles.missHead}>
              <Text style={styles.missFact}>{YESTERDAY_WASNT_SECURED}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                onPress={morningAfter.onDismiss}
                style={styles.missX}
              >
                <X size={META} color={DS_V3.color.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            <View style={styles.missBody}>
              <Text style={styles.secondary}>{morningAfter.cost}</Text>
              <Text style={styles.secondary}>{morningAfter.cushion}</Text>
              {morningAfter.onUseFreeze ? (
                <>
                  <Button label={USE_FREEZE_FOR_YESTERDAY} onPress={morningAfter.onUseFreeze} />
                  {morningAfter.freezeCaption ? (
                    <Text style={styles.missCap}>{morningAfter.freezeCaption}</Text>
                  ) : null}
                </>
              ) : null}
            </View>
          </Card>
        </View>
      ) : null}

      {proof ? (
        <View style={styles.gutter}>
          <Card>
            <View style={styles.cardHead}>
              <Text style={styles.heading}>{HOME_PROOF_HEADING}</Text>
              <View style={styles.countChip}>
                <Text style={styles.countTxt}>
                  {proof.doneCount} / {proof.totalCount}
                </Text>
              </View>
            </View>
            {proof.hasChallenge ? (
              proof.sections.map((section, i) => {
                const expanded = todaySectionExpanded(
                  sectionChoices?.[section.id],
                  section.doneCount,
                  section.totalCount,
                );
                return (
                <View key={section.id}>
                  {i > 0 ? <Divider style={styles.sectionDivider} /> : null}
                  <View style={i > 0 ? styles.sectionGap : styles.sectionFirst}>
                    <View style={styles.proofHead}>
                      <View style={styles.flex}>
                        {section.challengeId ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${section.challenge} challenge`}
                            onPress={() => onPressChallenge?.(section.challengeId!)}
                          >
                            <Text style={styles.task}>{section.challenge}</Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.task}>{section.challenge}</Text>
                        )}
                        <Text style={styles.caption}>{homeProofDayLine(section.day, section.dayTotal)}</Text>
                      </View>
                      <View style={styles.countChip}>
                        <Text style={styles.countTxt}>
                          {section.doneCount} / {section.totalCount}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={expanded ? "Collapse section" : "Expand section"}
                        onPress={() => onToggleSection?.(section.id, !expanded)}
                        style={styles.chevronHit}
                      >
                        {expanded ? (
                          <ChevronUp size={RING} color={DS_V3.color.textSecondary} />
                        ) : (
                          <ChevronDown size={RING} color={DS_V3.color.textSecondary} />
                        )}
                      </Pressable>
                    </View>
                    {expanded ? section.rows.map(renderRow) : null}
                  </View>
                </View>
                );
              })
            ) : (
              <Text style={[styles.secondary, styles.sectionFirst]}>No active challenge</Text>
            )}
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
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  missHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  missFact: {
    flex: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingTop: DS_V3.space.sm,
  },
  missX: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  missBody: {
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.md,
  },
  missCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  proofHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
    marginBottom: DS_V3.space.lg,
  },
  sectionFirst: {
    marginTop: DS_V3.space.lg,
  },
  sectionGap: {
    marginTop: DS_V3.space.lg,
  },
  sectionDivider: {
    marginTop: DS_V3.space.lg,
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
  chevronHit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
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
  ring: {
    width: RING,
    height: RING,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  ringDone: {
    backgroundColor: DS_V3.color.brand,
  },
  ringPending: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.textSecondary,
  },
  ringClosed: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.border,
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
  taskMuted: {
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
