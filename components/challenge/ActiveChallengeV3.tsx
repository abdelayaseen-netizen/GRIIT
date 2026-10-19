/**
 * Active challenge — frame 28. Presentation only. Bindings come from
 * lib/active-challenge-ui.ts. DS_V3 tokens, no hex.
 */
import React from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Camera,
  Check,
  Circle,
  Dumbbell,
  Droplet,
  Ellipsis,
  Hash,
  MapPin,
  NotebookPen,
  RotateCcw,
  ShieldOff,
  Timer,
  ChevronRight,
  Share,
  Snowflake,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import PushedHeader from "@/components/ds/PushedHeader";
import WeekStrip from "@/components/ds/WeekStrip";
import Stamp from "@/components/ds/Stamp";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import EmptyState from "@/components/ds/EmptyState";
import Skeleton from "@/components/ds/Skeleton";
import {
  RESET_NOTICE,
  doneGate,
  footerAction,
  hasCameraProof,
  pendingGate,
  resetBody,
  enrollmentTodayProgress,
  statusLine,
  taskVerb,
  type ActiveChallengeTask,
  type ActiveTaskType,
} from "@/lib/active-challenge-ui";
import { homeWindowClosed } from "@/lib/home-proof-card";
import { SHARE_TODAY, UNTIL_MIDNIGHT } from "@/lib/day-sticker";
import { DONE_FOR_TODAY } from "@/lib/challenge-today-copy";
import { THIS_WEEK } from "@/lib/g2a-challenge";
import {
  BOARD_LINK,
  COPY_LINK,
  FULL_RECORD,
  INVITE_MEMBERS,
  INVITE_TO,
  NO_SHARED_PROOFS_IN_CHALLENGE,
  recordLine,
} from "@/lib/v44-detail";
import {
  DOT_KEY,
  DOT_KEY_COPY,
  joinedPrimary,
  topNumbers,
  visibilityRow,
} from "@/lib/challenge-state";
import type { PostAudience } from "@/lib/post-audience";

const ICON = DS_V3.space.xs * 6;
const META_ICON = DS_V3.space.lg;
const PT = DS_V3.space.xs / 4;
const LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const FOOTER_CLEAR = DS_V3.space.section * 4 + DS_V3.space.md;

const TASK_ICON: Record<ActiveTaskType, LucideIcon> = {
  timer: Timer,
  reading: BookOpen,
  water: Droplet,
  counter: Hash,
  photo: Camera,
  checkin: MapPin,
  journal: NotebookPen,
  workout: Dumbbell,
  simple: Circle,
};

export type ActiveChallengeV3Props = {
  title: string;
  durationDays: number;
  currentDay: number;
  difficulty: "standard" | "hard";
  tasks: ActiveChallengeTask[];
  securedToday: boolean;
  streakDays: number;
  weekSecured: boolean[];
  todayIndex: number;
  participantsCount: number;
  participationType?: "solo" | "duo" | "team";
  description?: string;
  resetNotice?: boolean;
  loading?: boolean;
  error?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack: () => void;
  onMore?: () => void;
  onRetry?: () => void;
  onTask?: (task: ActiveChallengeTask) => void;
  onParticipants?: () => void;
  onShare?: () => void;
  showShareToday?: boolean;
  todayStatus?: string | null;
  weekLine?: string | null;
  weekDaysOverride?: { letter: string; filled: boolean; state?: "secured" | "frozen" | "last_stand" | "missed" | "future" | "before" | "na" }[];
  freezeRow?: {
    title: string;
    caption: string;
    icon: "snowflake" | "shield-off";
    actionLabel?: string | null;
  } | null;
  onUseFreeze?: () => void;
  people?: { heading: string; body: string; showInvite: boolean; inviteLabel: string } | null;
  onInvite?: () => void;
  todaySub?: string | null;
  prestartCard?: string | null;
  securedCount?: number;
  dueCount?: number;
  onCopyInvite?: () => void;
  onOpenBoard?: () => void;
  onOpenRecord?: () => void;
  /** Build 92 10.2: the dot key shows on first view; "Got it" hides it for this user. */
  showDotKey?: boolean;
  onDismissDotKey?: () => void;
  /** "Your posts here: {audience} ›" opens the audience sheet. */
  postsHere?: PostAudience | null;
  onPostsHere?: () => void;
};

export default function ActiveChallengeV3(p: ActiveChallengeV3Props) {
  const insets = useSafeAreaInsets();
  const shownReset = RESET_NOTICE && Boolean(p.resetNotice);
  const today = enrollmentTodayProgress(p.tasks);
  const line = statusLine(today);
  const footer = footerAction({ securedToday: today.securedToday, tasks: p.tasks });
  const todayDone = p.securedToday || today.securedToday;
  const primary = joinedPrimary(todayDone);
  const primaryTask = footer.kind === "next" && !footer.task.completed_today ? footer.task : null;
  const numbers = topNumbers({ day: p.currentDay, total: p.durationDays, secured: p.securedCount ?? 0 });
  const weekDays = LETTERS.map((letter, i) => ({
    letter,
    filled: p.weekSecured[i] === true,
  }));
  const about = (p.description ?? "").trim();

  if (p.error) {
    return (
      <View style={styles.canvas}>
        <PushedHeader
          title={p.title}
          onBack={p.onBack}
          trailing={moreButton(p.onMore)}
        />
        <View style={styles.errorWrap}>
          <EmptyState
            heading="Challenge did not load"
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onRetry={p.onRetry}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.canvas}>
      <PushedHeader
        title={p.title}
        onBack={p.onBack}
        trailing={moreButton(p.onMore)}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          p.onRefresh ? (
            <RefreshControl
              refreshing={Boolean(p.refreshing)}
              onRefresh={p.onRefresh}
              tintColor={DS_V3.color.textSecondary}
            />
          ) : undefined
        }
      >
        {p.prestartCard ? (
          <View style={styles.prestart}>
            <Text style={styles.status}>{p.prestartCard}</Text>
          </View>
        ) : null}

        <View style={styles.dayBlock}>
          {p.loading ? (
            <View style={styles.daySkel} />
          ) : (
            <>
              <Text testID="active-day-of" style={styles.dayOf}>{numbers.day}</Text>
              <Text testID="active-days-secured" style={styles.metaLine}>{numbers.secured}</Text>
            </>
          )}
        </View>

        {p.loading ? (
          <View style={styles.statusSkel} />
        ) : p.todayStatus ? (
          <View style={styles.statusRow}>
            <Text style={styles.secured}>{p.todayStatus}</Text>
            {p.todaySub ? <Text style={styles.status}>{p.todaySub}</Text> : null}
          </View>
        ) : line.kind === "secured" ? (
          <View style={styles.statusRow}>
            <Text style={styles.secured}>{DONE_FOR_TODAY}</Text>
            <Text style={styles.status}>{line.allDone}</Text>
          </View>
        ) : (
          <Text style={styles.status}>{line.text}</Text>
        )}

        {shownReset ? (
          <View style={styles.resetWrap}>
            <Card>
              <View style={styles.resetRow}>
                <RotateCcw size={ICON} color={DS_V3.color.textPrimary} />
                <View style={styles.resetCopy}>
                  <Text style={styles.resetTitle}>The run restarted</Text>
                  <Text style={styles.resetBody}>{resetBody()}</Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        <View style={styles.weekWrap}>
          <Text style={styles.label}>{THIS_WEEK}</Text>
          {p.weekLine ? <Text style={styles.status}>{p.weekLine}</Text> : null}
          {p.loading ? (
            <View style={styles.weekSkelRow}>
              {LETTERS.map((letter, i) => (
                <View key={`${letter}-${i}`} style={styles.weekSkelCell}>
                  <View style={styles.weekSkelSq} />
                </View>
              ))}
            </View>
          ) : (
            <WeekStrip
              days={p.weekDaysOverride ?? weekDays}
              todayIndex={p.todayIndex}
              fillToday={p.securedToday}
            />
          )}
          {p.showDotKey && !p.loading ? (
            <View testID="dot-key" style={styles.dotKey}>
              <Text style={styles.taskTitle}>{DOT_KEY_COPY.title}</Text>
              {DOT_KEY_ROWS.map((row) => (
                <View key={row.key} style={styles.dotKeyRow}>
                  <View style={[styles.dotKeySwatch, row.style]}>
                    {row.key === "freeze" ? <Snowflake size={10} color={DS_V3.color.textSecondary} /> : null}
                  </View>
                  <Text style={styles.caption}>{DOT_KEY[row.key]}</Text>
                </View>
              ))}
              <Pressable
                testID="dot-key-got-it"
                accessibilityRole="button"
                accessibilityLabel={DOT_KEY_COPY.done}
                onPress={p.onDismissDotKey}
                hitSlop={8}
              >
                <Text style={styles.link}>{DOT_KEY_COPY.done}</Text>
              </Pressable>
            </View>
          ) : null}
          {p.postsHere && p.onPostsHere ? (
            <Pressable
              testID="posts-here"
              accessibilityRole="button"
              accessibilityLabel={visibilityRow(p.postsHere)}
              onPress={p.onPostsHere}
              style={styles.postsHere}
            >
              <Text style={styles.caption}>{`${visibilityRow(p.postsHere)} ›`}</Text>
            </Pressable>
          ) : null}
        </View>
        {p.freezeRow ? (
          <View style={styles.freezeRow}>
            <View style={styles.freezeTop}>
              {p.freezeRow.icon === "shield-off" ? (
                <ShieldOff size={META_ICON} color={DS_V3.color.textSecondary} />
              ) : (
                <Snowflake size={META_ICON} color={DS_V3.color.textSecondary} />
              )}
              <View style={styles.resetCopy}>
                <Text style={styles.taskTitle}>{p.freezeRow.title}</Text>
                <Text style={styles.caption}>{p.freezeRow.caption}</Text>
              </View>
            </View>
            {p.freezeRow.actionLabel && p.onUseFreeze ? (
              <Button label={p.freezeRow.actionLabel} onPress={p.onUseFreeze} />
            ) : null}
          </View>
        ) : null}

        <Text style={styles.heading}>Today</Text>
        {p.loading ? (
          <View style={styles.taskSkel}>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </View>
        ) : (
          <View>
            {p.tasks.map((t, i) => {
              const closed = homeWindowClosed({ windowState: t.windowState, done: t.completed_today });
              const Icon = t.completed_today ? Check : TASK_ICON[t.task_type];
              const iconTone = t.completed_today ? DS_V3.color.textPrimary : DS_V3.color.textSecondary;
              return (
                <View key={t.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    testID="active-task"
                    accessibilityRole="button"
                    accessibilityLabel={t.title}
                    accessibilityState={{ disabled: t.completed_today || closed }}
                    disabled={t.completed_today || closed}
                    onPress={t.completed_today || closed ? undefined : () => p.onTask?.(t)}
                    style={styles.taskRow}
                  >
                    <Icon size={ICON} color={iconTone} />
                    <View style={styles.taskCopy}>
                      <Text style={t.completed_today || closed ? styles.taskTitleDone : styles.taskTitle}>
                        {t.title}
                      </Text>
                      <Text style={styles.caption}>
                        {t.completed_today ? doneGate(t) : pendingGate(t)}
                      </Text>
                    </View>
                    {t.completed_today ? (
                      hasCameraProof(t) ? (
                        <Stamp />
                      ) : (
                        <Text style={styles.caption}>Self-reported</Text>
                      )
                    ) : closed ? null : (
                      <Text style={styles.verb}>{taskVerb(t.task_type)}</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
            {p.showShareToday && p.onShare ? (
              <>
                <Text style={styles.todaySecured}>{p.todayStatus ?? DONE_FOR_TODAY}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={SHARE_TODAY}
                  onPress={p.onShare}
                  style={styles.taskRow}
                >
                  <Share size={ICON} color={DS_V3.color.textPrimary} />
                  <View style={styles.taskCopy}>
                    <Text style={styles.taskTitle}>{SHARE_TODAY}</Text>
                    <Text style={styles.caption}>{UNTIL_MIDNIGHT}</Text>
                  </View>
                  <ChevronRight size={ICON} color={DS_V3.color.textSecondary} />
                </Pressable>
              </>
            ) : null}
            {p.people ? (
              <View style={styles.peopleCard}>
                <Text style={styles.taskTitle}>{p.people.heading}</Text>
                {p.people.body ? <Text style={styles.caption}>{p.people.body}</Text> : null}
                {p.people.showInvite ? (
                  <Button label={p.people.inviteLabel} onPress={p.onInvite} />
                ) : null}
              </View>
            ) : p.participationType === "team" || p.participantsCount > 1 ? (
              <View style={styles.peopleCard}>
                <View style={styles.sectionHead}>
                  <Text style={styles.taskTitle}>This week board</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={BOARD_LINK} onPress={p.onOpenBoard}>
                    <Text style={styles.link}>{BOARD_LINK}</Text>
                  </Pressable>
                </View>
                <Text style={styles.caption}>Top 3, plus your row.</Text>
              </View>
            ) : (
              <View style={styles.peopleCard}>
                <Button label="Invite" onPress={p.onInvite} />
              </View>
            )}
            <View style={styles.peopleCard}>
              <Text style={styles.taskTitle}>Recent proofs</Text>
              <Text style={styles.caption}>{NO_SHARED_PROOFS_IN_CHALLENGE}</Text>
            </View>
            <View style={styles.peopleCard}>
              <Text style={styles.hero24}>{p.securedCount ?? 0}</Text>
              <Text style={styles.caption}>{recordLine(p.securedCount ?? 0, p.dueCount ?? p.durationDays)}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={FULL_RECORD} onPress={p.onOpenRecord}>
                <Text style={styles.link}>{FULL_RECORD}</Text>
              </Pressable>
            </View>
            <View style={styles.peopleCard}>
              <Text style={styles.taskTitle}>{INVITE_TO(p.title)}</Text>
              <Text style={styles.caption}>{INVITE_MEMBERS(p.participantsCount)}</Text>
              <Button label={COPY_LINK} variant="secondary" onPress={p.onCopyInvite ?? p.onInvite} />
            </View>
          </View>
        )}

        {about ? (
          <>
            <Text style={styles.heading}>About</Text>
            <Text style={styles.about}>{about}</Text>
          </>
        ) : null}

        <View style={styles.footerClear} />
      </ScrollView>

      {p.loading || p.tasks.length === 0 ? null : (
        <View style={[styles.footer, { paddingBottom: DS_V3.space.section + insets.bottom }]}>
          <Button
            testID="active-primary"
            label={primary.label}
            disabled={primary.disabled || !primaryTask}
            onPress={primaryTask ? () => p.onTask?.(primaryTask) : undefined}
          />
        </View>
      )}
    </View>
  );
}

const DOT_KEY_ROWS: { key: keyof typeof DOT_KEY; style: object }[] = [
  { key: "secured", style: { backgroundColor: DS_V3.color.textPrimary } },
  { key: "today", style: { borderWidth: 1.5, borderColor: DS_V3.color.textPrimary } },
  { key: "freeze", style: { borderWidth: 1, borderColor: DS_V3.color.textSecondary } },
  { key: "missed", style: { borderWidth: 1, borderColor: DS_V3.color.textTertiary, borderStyle: "dashed" } },
  { key: "before", style: { backgroundColor: DS_V3.color.raised } },
];

function moreButton(onMore?: () => void) {
  if (!onMore) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open challenge options"
      onPress={onMore}
      style={styles.more}
    >
      <Ellipsis size={ICON} color={DS_V3.color.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  prestart: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  dayBlock: {
    alignItems: "flex-start",
    gap: 2,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
  },
  metaLine: {
    fontSize: 13,
    lineHeight: 18,
    color: DS_V3.color.textSecondary,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  hero24: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  daySkel: {
    width: DS_V3.numberSize.home,
    height: DS_V3.numberSize.home,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  status: {
    alignSelf: "stretch",
    flexShrink: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  statusRow: {
    alignSelf: "stretch",
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 6,
  },
  secured: {
    flexShrink: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  todaySecured: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingTop: DS_V3.space.lg,
    paddingBottom: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
  },
  statusSkel: {
    marginTop: DS_V3.space.sm,
    marginHorizontal: DS_V3.space.gutter,
    height: DS_V3.space.lg,
    width: "50%",
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  resetWrap: {
    paddingTop: DS_V3.space.gutter,
    paddingHorizontal: DS_V3.space.gutter,
  },
  resetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.lg,
  },
  resetCopy: {
    flex: 1,
    gap: DS_V3.space.xs,
  },
  resetTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  resetBody: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  dayOf: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  dotKey: { gap: DS_V3.space.sm, paddingTop: DS_V3.space.md },
  dotKeyRow: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm },
  dotKeySwatch: {
    width: DS_V3.space.lg,
    height: DS_V3.space.lg,
    borderRadius: DS_V3.space.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  postsHere: { paddingTop: DS_V3.space.md },
  weekWrap: {
    paddingTop: DS_V3.space.lg + DS_V3.space.sm,
    paddingBottom: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
  },
  weekSkelRow: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  weekSkelCell: {
    flex: 1,
    alignItems: "center",
  },
  weekSkelSq: {
    alignSelf: "stretch",
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  heading: {
    paddingTop: DS_V3.space.section,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskSkel: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  divider: {
    height: PT,
    backgroundColor: DS_V3.color.border,
    marginHorizontal: DS_V3.space.gutter,
  },
  taskRow: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  taskCopy: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    flex: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskTitleDone: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  verb: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  about: {
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footerClear: {
    height: FOOTER_CLEAR,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase" as const,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.gutter,
    marginBottom: DS_V3.space.xs,
  },
  freezeRow: {
    gap: DS_V3.space.md,
    marginHorizontal: DS_V3.space.gutter,
    marginTop: DS_V3.space.sm,
    marginBottom: DS_V3.space.lg,
    padding: DS_V3.space.lg,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
  },
  freezeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  peopleCard: {
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.lg,
    marginHorizontal: DS_V3.space.gutter,
    padding: DS_V3.space.lg,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: DS_V3.space.gutter,
    paddingHorizontal: DS_V3.space.gutter,
    backgroundColor: DS_V3.color.canvas,
    borderTopWidth: PT,
    borderTopColor: DS_V3.color.border,
  },
  more: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
});
