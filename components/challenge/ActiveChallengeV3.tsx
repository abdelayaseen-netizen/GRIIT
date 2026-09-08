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
  Dumbbell,
  Droplet,
  Ellipsis,
  Flame,
  Hash,
  MapPin,
  NotebookPen,
  RotateCcw,
  Shield,
  ShieldOff,
  Timer,
  Users,
  ChevronRight,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import PushedHeader from "@/components/ds/PushedHeader";
import DisplayNumber from "@/components/ds/DisplayNumber";
import WeekStrip from "@/components/ds/WeekStrip";
import Stamp from "@/components/ds/Stamp";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import EmptyState from "@/components/ds/EmptyState";
import Skeleton from "@/components/ds/Skeleton";
import {
  RESET_NOTICE,
  difficultyLine,
  doneGate,
  footerAction,
  hasCameraProof,
  participantsLine,
  pendingGate,
  resetBody,
  statusLine,
  streakCaption,
  taskVerb,
  type ActiveChallengeTask,
  type ActiveTaskType,
} from "@/lib/active-challenge-ui";

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
};

export default function ActiveChallengeV3(p: ActiveChallengeV3Props) {
  const insets = useSafeAreaInsets();
  const shownReset = RESET_NOTICE && Boolean(p.resetNotice);
  const done = p.tasks.filter((t) => t.completed_today).length;
  const line = statusLine({
    securedToday: p.securedToday,
    done,
    total: p.tasks.length,
  });
  const footer = footerAction({ securedToday: p.securedToday, tasks: p.tasks });
  const weekDays = LETTERS.map((letter, i) => ({
    letter,
    filled: p.weekSecured[i] === true,
  }));
  const about = (p.description ?? "").trim();
  const hard = p.difficulty === "hard";

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
              tintColor={DS_V3.color.brand}
            />
          ) : undefined
        }
      >
        <View style={styles.dayBlock}>
          <Text style={styles.dayLabel}>Day</Text>
          {p.loading ? (
            <View style={styles.daySkel} />
          ) : (
            <DisplayNumber value={p.currentDay} size="home" />
          )}
          <Text style={styles.ofLabel}>of {p.durationDays}</Text>
        </View>

        {p.loading ? (
          <View style={styles.statusSkel} />
        ) : line.kind === "secured" ? (
          <View style={styles.statusRow}>
            <Text style={styles.secured}>Day secured.</Text>
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
                  <Text style={styles.resetBody}>{resetBody(p.durationDays)}</Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        <View style={styles.weekWrap}>
          {p.loading ? (
            <View style={styles.weekSkelRow}>
              {LETTERS.map((letter, i) => (
                <View key={`${letter}-${i}`} style={styles.weekSkelCell}>
                  <View style={styles.weekSkelSq} />
                </View>
              ))}
            </View>
          ) : (
            <WeekStrip days={weekDays} todayIndex={p.todayIndex} />
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            {hard ? (
              <ShieldOff size={META_ICON} color={DS_V3.color.textSecondary} />
            ) : (
              <Shield size={META_ICON} color={DS_V3.color.textSecondary} />
            )}
            <Text style={styles.caption}>{difficultyLine(p.difficulty)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={META_ICON} color={DS_V3.color.textSecondary} />
            {p.streakDays > 0 ? (
              <View style={styles.streakNum}>
                <DisplayNumber value={p.streakDays} size="inline" />
                <Text style={styles.caption}>{streakCaption(p.streakDays)}</Text>
              </View>
            ) : (
              <Text style={styles.caption}>{streakCaption(0)}</Text>
            )}
          </View>
        </View>

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
              const Icon = t.completed_today ? Check : TASK_ICON[t.task_type];
              const iconTone = t.completed_today ? DS_V3.color.brandText : DS_V3.color.textSecondary;
              return (
                <View key={t.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t.title}
                    accessibilityState={{ disabled: t.completed_today }}
                    disabled={t.completed_today}
                    onPress={t.completed_today ? undefined : () => p.onTask?.(t)}
                    style={styles.taskRow}
                  >
                    <Icon size={ICON} color={iconTone} />
                    <View style={styles.taskCopy}>
                      <Text style={t.completed_today ? styles.taskTitleDone : styles.taskTitle}>
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
                    ) : (
                      <Text style={styles.verb}>{taskVerb(t.task_type)}</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
            {p.participantsCount > 1 ? (
              <>
                <View style={styles.divider} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={participantsLine(p.participantsCount)}
                  onPress={p.onParticipants}
                  style={styles.taskRow}
                >
                  <Users size={ICON} color={DS_V3.color.textSecondary} />
                  <Text style={styles.taskTitle}>{participantsLine(p.participantsCount)}</Text>
                  <ChevronRight size={ICON} color={DS_V3.color.textSecondary} />
                </Pressable>
              </>
            ) : null}
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

      {p.loading ? null : (
        <View style={[styles.footer, { paddingBottom: DS_V3.space.section + insets.bottom }]}>
          {footer.kind === "share" ? (
            <Button label="Share today's proof" variant="secondary" onPress={p.onShare} />
          ) : footer.kind === "next" ? (
            <Button
              label={`${taskVerb(footer.task.task_type)} · ${footer.task.title}`}
              onPress={() => p.onTask?.(footer.task)}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

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
  dayBlock: {
    paddingTop: DS_V3.space.lg + DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.sm + 2,
  },
  dayLabel: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingBottom: 11,
  },
  ofLabel: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingBottom: 9,
  },
  daySkel: {
    width: DS_V3.numberSize.home,
    height: DS_V3.numberSize.home,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  status: {
    paddingTop: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  statusRow: {
    paddingTop: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  secured: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
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
  weekWrap: {
    paddingTop: DS_V3.space.lg + DS_V3.space.sm,
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
  metaRow: {
    paddingTop: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.gutter,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streakNum: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
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
    color: DS_V3.color.brandText,
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
