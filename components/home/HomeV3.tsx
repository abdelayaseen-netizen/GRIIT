/**
 * HomeV3 — frame 01 + 02_screens.md Home tree (presentation).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarClock, Check, ChevronDown, ChevronRight, ChevronUp, Share, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import { StreakStrip } from "@/components/ds/StreakStrip";
import { homeStatus } from "@/lib/home-status";
import Button from "@/components/ds/Button";
import Divider from "@/components/ds/Divider";
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
  homeSectionToggleA11y,
  homeProofRingState,
  homeProofTitleMuted,
  type HomeProofCard,
  type HomeProofRow,
} from "@/lib/home-proof-card";
import { DAY_SECURED, SHARE_TODAY } from "@/lib/day-sticker";
import { USE_FREEZE_FOR_YESTERDAY, YESTERDAY_WASNT_SECURED } from "@/lib/morning-after";
import { todaySectionExpanded } from "@/lib/today-section-collapse";
import { homePrestartLine, type QueuedHomeRow } from "@/lib/home-starts-tomorrow";
import {
  FIRST_PROOF_SLOT_BODY,
  FIRST_PROOF_SLOT_HEADING,
  SECTION_DONE,
  firstClosedUndoneTask,
} from "@/lib/g2a-home";

const RING = 22;
const RING_CHECK = DS_V3.space.md;
const META = DS_V3.space.lg;
const STROKE = (DS_V3.space.xs * 3) / 8;
export function StatusRing({ row }: { row: HomeProofRow }) {
  const state = homeProofRingState(row);
  if (state === "done") {
    return (
      <View style={[styles.ring, styles.ringDone]} accessibilityLabel={homeRingA11y("done")}>
        <Check size={RING_CHECK} color={DS_V3.color.canvas} strokeWidth={2.5} />
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
  showFirstProofSlot?: boolean;
  noDaysOff?: boolean;
  highlightTaskId?: string | null;
};

export function HomeV3({
  title: _title,
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
  sectionChoices,
  onToggleSection,
  freezesLeft: _freezesLeft,
  showFreezeChip: _showFreezeChip = false,
  loading,
  error,
  onRetry,
  firstDayLine,
  day2Hero: _day2Hero,
  windowBanner: _windowBanner,
  startLabel,
  showFirstProofSlot,
  noDaysOff: _noDaysOff = false,
  highlightTaskId,
}: HomeV3Props) {
  const insets = useSafeAreaInsets();

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
    secured: allDone,
    left: proof ? Math.max(0, proof.totalCount - proof.doneCount) : 0,
    total: proof?.totalCount ?? 0,
    lostTask: todayBlocked ? closedUndone?.name : null,
    lostAt: todayBlocked ? closedUndone?.closedAt : null,
    otherTask: todayBlocked ? openRow?.name : null,
    otherChallenge: todayBlocked ? openSection?.challenge : null,
    nextTask: openRow?.name,
  });
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"].map((letter, i) => ({
    letter,
    filled: weekStates?.[i] === "secured" || weekStates?.[i] === "frozen",
    state: weekStates?.[i],
  }));

  const renderRow = (row: HomeProofRow) => {
    const inner = (
      <>
        <StatusRing row={row} />
        <View style={styles.taskCopy}>
          <Text style={[styles.task, homeProofTitleMuted(row) ? styles.taskMuted : null]}>{row.name}</Text>
          <Text style={styles.caption}>{row.caption}</Text>
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
      <StreakStrip
        streak={streak ?? 0}
        days={weekDays}
        todayIndex={todayIndex}
        status={status}
        onOpenSheet={() => onPressStreak?.()}
        primary={startLabel ? <Button label={startLabel} onPress={_onPressProof} /> : undefined}
      />

      {morningAfter ? (
        <View style={styles.gutter}>
          <Card>
            <View style={styles.missHead}>
              <Text style={styles.missFact}>{YESTERDAY_WASNT_SECURED}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
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
                            accessibilityLabel={homeChallengeOpenA11y(section.challenge)}
                            onPress={() => onPressChallenge?.(section.challengeId!)}
                          >
                            <Text style={styles.task}>{section.challenge}</Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.task}>{section.challenge}</Text>
                        )}
                        <Text style={styles.caption}>{homeProofDayLine(section.day, section.dayTotal)}</Text>
                        {i === 0 && firstDayLine ? <Text style={styles.caption}>{firstDayLine}</Text> : null}
                      </View>
                      {section.doneCount === section.totalCount && section.totalCount > 0 ? (
                        <View style={styles.sectionDone}>
                          <Check size={14} color={DS_V3.color.brand} />
                          <Text style={styles.sectionDoneTxt}>{SECTION_DONE}</Text>
                        </View>
                      ) : (
                        <Text style={styles.countTxt}>
                          {section.doneCount} of {section.totalCount} done
                        </Text>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={homeSectionToggleA11y(expanded, section.challenge)}
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
              <View style={styles.emptyChallenge}>
                <Text style={styles.secondary}>{NO_CHALLENGE_YET}</Text>
                <View style={styles.emptyActions}>
                  <Button label={FIND_A_CHALLENGE} onPress={onFindChallenge} boxHeight={40} />
                  <Button label={CREATE_CHALLENGE} variant="secondary" onPress={onCreateChallenge} boxHeight={40} />
                </View>
              </View>
            )}
            {allDone ? (
              <View style={styles.shareTodayBlock}>
                <Text style={styles.daySecured}>{DAY_SECURED}</Text>
                {proof.showShareToday ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={SHARE_TODAY}
                    onPress={onPressShareToday}
                    style={styles.sharePill}
                  >
                    <Text style={styles.sharePillTxt}>{SHARE_TODAY}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : proof.showShareToday ? (
              <View style={styles.shareTodayBlock}>
                <Text style={styles.daySecured}>{DAY_SECURED}</Text>
                <Divider />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={SHARE_TODAY}
                  onPress={onPressShareToday}
                  style={styles.shareTodayRow}
                >
                  <Share size={RING} color={DS_V3.color.textSecondary} />
                  <View style={styles.taskCopy}>
                    <Text style={styles.task}>{SHARE_TODAY}</Text>
                    <Text style={styles.caption}>{proof.shareTodayCaption}</Text>
                  </View>
                  <ChevronRight size={RING} color={DS_V3.color.textSecondary} />
                </Pressable>
              </View>
            ) : null}
          </Card>
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
                <Text style={styles.task}>{homePrestartLine(row.name)}</Text>
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
    backgroundColor: DS_V3.color.brand,
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
  prestart: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
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
    minHeight: 48,
    marginBottom: DS_V3.space.md,
  },
  rowFlash: {
    backgroundColor: DS_V3.color.brandTint,
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
    color: DS_V3.color.brandText,
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
    color: DS_V3.color.brandText,
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
    color: DS_V3.color.brandText,
  },
  sharePill: {
    height: 36,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.brand,
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
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_V3.color.brand,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
