/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarClock, Check, ChevronDown, ChevronRight, ChevronUp, Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import WeekStrip from "@/components/ds/WeekStrip";
import { homeStatus } from "@/lib/home-status";
import { greetingSub } from "@/lib/greeting";
import Button from "@/components/ds/Button";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import { greetingName } from "@/lib/profile-display";
import type { WeekStripDayState } from "@/lib/week-strip-days";
import {
  CREATE_CHALLENGE,
  FIND_A_CHALLENGE,
  NO_CHALLENGE_YET,
} from "@/lib/g2b-home";
import {
  HOME_PROOF_HEADING,
  homeChallengeOpenA11y,
  homeProofDayLine,
  homeRingA11y,
  homeProofRingState,
  homeProofTitleMuted,
  type HomeProofCard,
  type HomeProofRow,
  type HomeProofSection,
} from "@/lib/home-proof-card";
import { FREEZE, FREEZE_LINE } from "@/lib/copy";
import { DAY_ONE_SUB, DAY_ONE_WORDS, bestLabel, freezeHoldLine, homeAction, streakNumeralSize, todayNextLine, type HomeNextTask } from "@/lib/home-top";
import { streakInARow } from "@/lib/task-complete-toast";
import { homePrestartLine, type QueuedHomeRow } from "@/lib/home-starts-tomorrow";
import { JOIN_CAPTION_TOMORROW } from "@/lib/challenge-detail-mapping";
import {
  FIRST_PROOF_SLOT_BODY,
  FIRST_PROOF_SLOT_HEADING,
  firstClosedUndoneTask,
} from "@/lib/g2a-home";

const RING = 22;
const RING_CHECK = DS_V3.space.md;
const STROKE = (DS_V3.space.xs * 3) / 8;
export function StatusRing({ row }: { row: HomeProofRow }) {
  const state = homeProofRingState(row);
  if (state === "done") {
    return (
      <View style={[styles.ring, styles.ringDone]} accessibilityLabel={homeRingA11y("done")}>
        <Check size={RING_CHECK} color={DS_V3.color.textPrimary} strokeWidth={2.5} />
      </View>
    );
  }
  return (
    <View
      style={[styles.ring, state === "closed" ? styles.ringClosed : styles.ringPending]}
      accessibilityLabel={homeRingA11y(state)}
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

export type HomeFollowingItem = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  when: string;
  line: string;
};

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
  startsTomorrow?: QueuedHomeRow[];
  weekFilled?: boolean[];
  weekStates?: WeekStripDayState[];
  todayIndex: number;
  fillToday?: boolean;
  following?: HomeFollowingItem[];
  onSeeAllActivity?: () => void;
  onPressFollowing?: (id: string) => void;
  onFindChallenge?: () => void;
  onCreateChallenge?: () => void;
  onPressStreak?: () => void;
  onPressProof: () => void;
  onPressTask?: (id: string) => void;
  onPressChallenge?: (challengeId: string) => void;
  onPressShareToday?: () => void;
  sectionChoices?: Record<string, boolean | undefined>;
  onToggleSection?: (sectionId: string, expanded: boolean) => void;
  freezesLeft: number;
  showFreezeChip?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  firstDayLine?: string | null;
  day2Hero?: { hero: string; line: string } | null;
  windowBanner?: string | null;
  startLabel?: string | null;
  band?: React.ReactNode;
  showFirstProofSlot?: boolean;
  noDaysOff?: boolean;
  highlightTaskId?: string | null;
  /** Server day_secures already includes today. A later join does not clear it. */
  daySecured?: boolean;
  /** 1–7 while the strip counts days from the first enrollment. */
  firstWeekDay?: number | null;
  /** Replaces Mon–Sun letters. First week uses "1"–"7". */
  weekLetters?: readonly string[];
  bestStreak?: number | null;
  nextTask?: HomeNextTask | null;
  /** "Thursday, Oct 8" under the greeting. */
  dateLine?: string | null;
};

export function HomeV3({
  title,
  streak,
  streakLine: _streakLine,
  morningAfter,
  proof,
  startsTomorrow,
  weekFilled: _weekFilled,
  weekStates,
  todayIndex,
  fillToday: _fillToday,
  following: _following = [],
  onSeeAllActivity: _onSeeAllActivity,
  onPressFollowing: _onPressFollowing,
  onFindChallenge,
  onCreateChallenge,
  onPressStreak,
  onPressProof: _onPressProof,
  onPressTask,
  onPressChallenge,
  onPressShareToday,
  sectionChoices: _sectionChoices,
  onToggleSection: _onToggleSection,
  freezesLeft,
  showFreezeChip: _showFreezeChip = false,
  loading,
  error,
  onRetry,
  firstDayLine,
  day2Hero: _day2Hero,
  windowBanner: _windowBanner,
  startLabel: _startLabel,
  band: _band,
  showFirstProofSlot,
  noDaysOff: _noDaysOff = false,
  highlightTaskId,
  daySecured = false,
  firstWeekDay: firstWeek = null,
  weekLetters,
  bestStreak,
  nextTask = null,
  dateLine = null,
}: HomeV3Props) {
  const insets = useSafeAreaInsets();
  const [doneOpen, setDoneOpen] = useState(false);

  if (error) {
    return (
      <View style={[styles.root, styles.pad]}>
        <EmptyState
          heading="Today didn’t load"
          body="Your streak and proofs are safe. Check your connection and try again."
          actionLabel="Try again"
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

  const homeRows = proof?.sections.flatMap((s) => s.rows) ?? [];
  const closedUndone = firstClosedUndoneTask(homeRows);
  const todayBlocked = Boolean(proof?.hasChallenge && closedUndone);
  const allDone = Boolean(
    proof?.hasChallenge && proof.totalCount > 0 && proof.doneCount === proof.totalCount,
  );
  const openRow = homeRows.find((row) => !row.done && !row.closed);
  const openSection = proof?.sections.find((section) =>
    section.rows.some((row) => !row.done && !row.closed),
  );
  const status = homeStatus({
    hasChallenge: Boolean(proof?.hasChallenge),
    secured: daySecured || allDone,
    left: proof ? Math.max(0, proof.totalCount - proof.doneCount) : 0,
    total: proof?.totalCount ?? 0,
    lostTask: todayBlocked ? closedUndone?.name : null,
    lostAt: todayBlocked ? closedUndone?.closedAt : null,
    otherTask: todayBlocked ? openRow?.name : null,
    otherChallenge: todayBlocked ? openSection?.challenge : null,
    nextTask: openRow?.name,
  });
  const letters = weekLetters ?? ["M", "T", "W", "T", "F", "S", "S"];
  const weekDays = letters.map((letter, i) => ({
    letter,
    filled: weekStates?.[i] === "secured" || weekStates?.[i] === "frozen",
    state: weekStates?.[i],
  }));
  const openCount = homeRows.filter((row) => !row.done && !row.closed).length;
  const sub = greetingSub({
    secured: daySecured || allDone,
    nextTask: openRow?.name,
    openCount,
    firstWeekDay: firstWeek,
    blocked: status,
  });
  const streakN = streak ?? 0;
  const action = homeAction({
    securedToday: daySecured || allDone,
    yesterdayUnsecured: Boolean(morningAfter?.onUseFreeze),
    freezesLeft,
    nextTask,
  });
  const numeral = streakNumeralSize(streakN);
  const dayOne = firstWeek === 1 && streakN === 0;
  const cardSub = action.kind === "freeze"
    ? freezeHoldLine(streakN, freezesLeft)
    : dayOne
      ? DAY_ONE_SUB
      : action.kind === "share"
        ? "Day secured. See you tomorrow."
        : action.kind === "task"
          ? todayNextLine(nextTask?.title ?? openRow?.name, openCount, proof?.totalCount ?? openCount)
          : sub;

  const renderRow = (section: HomeProofSection, row: HomeProofRow) => {
    const dayLine = homeProofDayLine(section.day, section.dayTotal);
    const meta = `${section.challenge} · ${dayLine} · ${row.caption}`;
    const inner = (
      <>
        <StatusRing row={row} />
        <View style={styles.taskCopy}>
          <Text style={[styles.task, homeProofTitleMuted(row) ? styles.taskMuted : null]}>{row.name}</Text>
          {section.challengeId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={homeChallengeOpenA11y(section.challenge)}
              onPress={() => onPressChallenge?.(section.challengeId!)}
            >
              <Text style={styles.caption}>{meta}</Text>
            </Pressable>
          ) : (
            <Text style={styles.caption}>{meta}</Text>
          )}
        </View>
        {!row.done ? (
          <ChevronRight size={RING} color={DS_V3.color.textSecondary} accessibilityLabel="Open" />
        ) : null}
      </>
    );
    if (row.done) {
      return (
        <View key={row.id} style={[styles.proofRow, highlightTaskId === row.id ? styles.rowFlash : null]}>
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
        style={[styles.proofRow, highlightTaskId === row.id ? styles.rowFlash : null]}
      >
        {inner}
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {title ? (
        <Text testID="home-greeting" style={styles.greeting} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {dateLine ? <Text testID="home-date" style={styles.dateLine}>{dateLine}</Text> : null}
      <View style={styles.topCard}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Streak"
            onPress={() => onPressStreak?.()}
            style={styles.flameTile}
          >
            <Flame size={22} color={DS_V3.color.brand} fill={DS_V3.color.brand} />
          </Pressable>
          {dayOne ? (
            <Text style={styles.dayOne}>Day 1</Text>
          ) : (
            <Text
              maxFontSizeMultiplier={1.6}
              style={[styles.numeral, { fontSize: numeral, lineHeight: Math.round(numeral * 1.1), letterSpacing: numeral * -0.025 }]}
            >
              {streakN.toLocaleString("en-US")}
            </Text>
          )}
          <Text style={styles.streakWords} numberOfLines={2}>{dayOne ? DAY_ONE_WORDS : streakInARow(streakN)}</Text>
          {dayOne ? null : <Text style={styles.best} numberOfLines={2}>{bestLabel(streakN, bestStreak ?? streakN)}</Text>}
        </View>
        <WeekStrip days={weekDays} todayIndex={todayIndex} />
        <View style={styles.hair} />
        {cardSub ? <Text testID="home-card-sub" style={styles.cardSub}>{cardSub}</Text> : null}
        {action.kind === "share" ? (
          <Button label={action.label} variant="tertiary" ink onPress={onPressShareToday} />
        ) : null}
        {action.kind === "freeze" ? (
          <Button label={action.label} onPress={morningAfter?.onUseFreeze} />
        ) : null}
        {action.kind === "task" ? (
          <Button label={action.label} onPress={() => onPressTask?.(action.taskId)} />
        ) : null}
      </View>

      {morningAfter?.onUseFreeze && action.kind !== "freeze" ? (
        <View style={styles.freezeRow}>
          <Text style={styles.secondary}>{FREEZE_LINE}</Text>
          <Button label={FREEZE.button} variant="secondary" onPress={morningAfter.onUseFreeze} />
        </View>
      ) : null}

      {proof ? (
        <View style={styles.today}>
          {proof.hasChallenge ? (
            <>
              <View style={styles.todayHead}>
                <Text style={styles.heading}>{HOME_PROOF_HEADING}</Text>
                <Text testID="home-today-count" style={styles.countTxt}>
                  {proof.doneCount} of {proof.totalCount} done
                </Text>
              </View>
              {firstDayLine ? <Text style={styles.caption}>{firstDayLine}</Text> : null}
              {proof.sections.flatMap((section) =>
                section.rows.filter((row) => !row.done).map((row) => renderRow(section, row)),
              )}
              {(() => {
                const done = proof.sections.flatMap((section) =>
                  section.rows.filter((row) => row.done).map((row) => ({ section, row })),
                );
                if (done.length === 0) return null;
                const label = done.length === 1 ? "1 done" : `${done.length} done`;
                return (
                  <View>
                    <Pressable
                      testID="home-done"
                      accessibilityRole="button"
                      accessibilityLabel={label}
                      onPress={() => setDoneOpen((open) => !open)}
                      style={styles.proofRow}
                    >
                      <View style={[styles.ring, styles.ringDone]}>
                        <Check size={RING_CHECK} color={DS_V3.color.textPrimary} strokeWidth={2.5} />
                      </View>
                      <View style={styles.taskCopy}>
                        <Text style={styles.task}>{label}</Text>
                        <Text style={styles.caption}>{done.map((item) => item.row.name).join(" · ")}</Text>
                      </View>
                      <View style={styles.chevronHit}>
                        {doneOpen ? (
                          <ChevronUp size={RING} color={DS_V3.color.textSecondary} />
                        ) : (
                          <ChevronDown size={RING} color={DS_V3.color.textSecondary} />
                        )}
                      </View>
                    </Pressable>
                    {doneOpen ? <View testID="home-done-open">{done.map((item) => renderRow(item.section, item.row))}</View> : null}
                  </View>
                );
              })()}
            </>
          ) : (
            <View style={styles.emptyChallenge}>
              <Text style={styles.secondary}>{NO_CHALLENGE_YET}</Text>
              <View style={styles.emptyActions}>
                <Button label={FIND_A_CHALLENGE} onPress={onFindChallenge} boxHeight={40} />
                <Button label={CREATE_CHALLENGE} variant="secondary" onPress={onCreateChallenge} boxHeight={40} />
              </View>
            </View>
          )}
        </View>
      ) : null}

      {showFirstProofSlot ? (
        <View style={styles.gutter}>
          <View style={styles.firstSlot} accessibilityLabel={FIRST_PROOF_SLOT_HEADING}>
            <Text style={styles.task}>{FIRST_PROOF_SLOT_HEADING}</Text>
            <Text style={styles.caption}>{FIRST_PROOF_SLOT_BODY}</Text>
          </View>
        </View>
      ) : null}

      {startsTomorrow && startsTomorrow.length > 0
        ? startsTomorrow.map((row) => (
            <View key={row.id} style={styles.gutter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={homePrestartLine(row.name)}
                onPress={() => row.challengeId && onPressChallenge?.(row.challengeId)}
                style={styles.prestart}
              >
                <CalendarClock size={RING} color={DS_V3.color.textSecondary} />
                <View style={styles.prestartCopy}>
                  <Text style={styles.task}>{row.name}</Text>
                  <Text style={styles.caption}>{JOIN_CAPTION_TOMORROW}</Text>
                </View>
              </Pressable>
            </View>
          ))
        : null}

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  greeting: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    fontSize: DS_V3.type.titleL.fontSize,
    lineHeight: DS_V3.type.titleL.lineHeight,
    fontWeight: DS_V3.type.titleL.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  dateLine: {
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  dayOne: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  today: {
    marginTop: DS_V3.space.section,
    paddingHorizontal: DS_V3.space.gutter,
  },
  todayHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingBottom: DS_V3.space.sm,
  },
  topCard: {
    marginHorizontal: DS_V3.space.gutter,
    marginTop: DS_V3.space.md,
    backgroundColor: DS_V3.color.surface,
    borderRadius: 20,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  flameTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: DS_V3.color.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  numeral: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  streakWords: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  best: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  hair: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DS_V3.color.hairline,
  },
  cardSub: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  pad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  homeHead: {
    height: 56,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  homeHeadCopy: {
    flex: 1,
    gap: 2,
  },
  dateCaption: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  homeName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DS_V3.color.textPrimary,
  },
  streakChip: {
    height: 32,
    paddingHorizontal: 10,
    paddingLeft: 8,
    borderRadius: DS_V3.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakChipNum: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  emptyChallenge: {
    marginTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  emptyActions: {
    gap: DS_V3.space.sm,
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
  freezeRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.sm,
  },
  prestart: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  prestartCopy: {
    flex: 1,
    gap: 2,
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
  chevronHit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  countTxt: {
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
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
    paddingVertical: DS_V3.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_V3.color.hairline,
  },
  rowFlash: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: 12,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  ringDone: {
    backgroundColor: DS_V3.color.raised,
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
    backgroundColor: DS_V3.color.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
  },
  doneTxt: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  week: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  weekLabel: {
    ...DS_V3.type.label,
    color: DS_V3.color.textSecondary,
  },
  following: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  followRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  seeAllHit: {
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
  },
  seeAll: {
    ...DS_V3.type.bodyStrong,
    color: DS_V3.color.textPrimary,
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
  shareTodayBlock: {
    marginTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  daySecured: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  shareTodayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  hero28: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  closedBlock: {
    marginTop: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.md,
  },
  closedTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  sectionDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionDoneTxt: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  sharePill: {
    height: 36,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  sharePillTxt: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.onBrand,
  },
  gap20: { height: DS_V3.space.gutter },
  day2Hero: {
    gap: DS_V3.space.xs,
    paddingBottom: DS_V3.space.sm,
  },
  startWrap: {
    marginTop: DS_V3.space.md,
  },
  firstSlot: {
    minHeight: DS_V3.size.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.hairline,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
