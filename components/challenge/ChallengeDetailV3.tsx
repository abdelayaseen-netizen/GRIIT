/**
 * Challenge detail, not joined — frame 29. Presentation only.
 * Copy from griit_brand/briefs/15/cursor/02_screens.md. DS_V3 tokens, no hex.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Camera,
  ChevronLeft,
  Circle,
  Dumbbell,
  Droplet,
  Ellipsis,
  Hash,
  MapPin,
  Pencil,
  Sunrise,
  Timer,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import { Cover } from "@/components/ds/Cover";
import { catalogCoverCategory } from "@/lib/catalog-cover";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";
import Skeleton from "@/components/ds/Skeleton";
import {
  joinCaption,
  MODE_STANDARD_DETAIL,
  MODE_STRICT_DETAIL,
  type ChallengeDetailTask,
  type DetailState,
  type ParticipationType,
} from "@/lib/challenge-detail-mapping";
import {
  GROUP_INVITE_ONLY_CAPTION,
  invitedCaption,
  ofTen,
} from "@/lib/group-ui";

const PT = DS_V3.space.xs / 4;
const ICON = 22;
const FOOTER_CLEAR = 176;

const TASK_ICON: Record<string, LucideIcon> = {
  timer: Timer,
  workout: Dumbbell,
  outdoor: Sunrise,
  reading: BookOpen,
  water: Droplet,
  counter: Hash,
  photo: Camera,
  checkin: MapPin,
  journal: Pencil,
};

const PARTICIPATION_LABEL: Record<ParticipationType, string> = {
  solo: "Solo",
  duo: "Duo",
  team: "Team",
};

export type ChallengeDetailInvite = {
  inviterName: string;
  memberCount: number;
  cap: number;
};

export type ChallengeDetailV3Props = {
  title: string;
  description?: string;
  durationDays: number;
  participationType: ParticipationType;
  participantsCount: number;
  tasks: ChallengeDetailTask[];
  state: DetailState;
  isHardMode: boolean;
  activeCount?: number;
  freeLimit?: number;
  endsOn?: string;
  startsOn?: string;
  joining?: boolean;
  loading?: boolean;
  error?: boolean;
  privateLocked?: boolean;
  invite?: ChallengeDetailInvite;
  /** Profile-finished header. When set, Join is never shown. */
  finishedLine?: string;
  finishedCtaLabel?: string;
  onBack: () => void;
  onMore?: () => void;
  onJoin?: () => void;
  onStartAgain?: () => void;
  onAccept?: () => void;
  onNotNow?: () => void;
  onUpgrade?: () => void;
  onRetry?: () => void;
  /** Account day is already in day_secures, or the task window has closed. Day 1 is tomorrow. */
  todayAlreadySecured?: boolean;
  windowClosed?: boolean;
  category?: string | null;
  peopleNames?: string[];
};

function peopleLabel(n: number): string {
  return n === 1 ? "1 person" : `${n} people`;
}

function peopleInIt(names: string[] | undefined, total: number): string {
  const shown = (names ?? []).map((n) => n.trim()).filter(Boolean).slice(0, 2);
  if (shown.length === 0) return total === 1 ? "1 person" : `${total} people`;
  const rest = Math.max(0, total - shown.length);
  if (rest <= 0) return shown.join(" and ");
  if (shown.length === 1) return `${shown[0]} and ${rest} ${rest === 1 ? "other" : "others"}`;
  return `${shown[0]}, ${shown[1]} and ${rest} others`;
}

export default function ChallengeDetailV3(p: ChallengeDetailV3Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const coverW = Math.max(200, Math.round(windowWidth - DS_V3.space.gutter * 2));
  const deferDay1 = p.todayAlreadySecured === true || p.windowClosed === true;
  const closed = p.state === "ended" || p.state === "not_live";
  const blocked = p.state === "free_limit";
  const invited = !!p.invite;
  const inviteOnly = p.participationType === "team" && !p.invite;
  const description = (p.description ?? "").trim();
  const footerPad = blocked ? 24 : 28;
  const footerTop = blocked ? 14 : DS_V3.space.lg;
  const isSolo = p.participationType === "solo";
  const peopleChip = invited
    ? ofTen(p.invite!.memberCount)
    : isSolo
      ? null
      : p.participantsCount <= 0
        ? null
        : p.participationType === "team"
          ? ofTen(p.participantsCount)
          : peopleLabel(p.participantsCount);

  if (p.privateLocked) {
    return (
      <View style={styles.canvas}>
        <Nav onBack={p.onBack} />
        <View style={styles.errorWrap}>
          <EmptyState
            heading="This challenge is private."
            body="Ask the creator for an invite."
            actionLabel="Go back"
            onAction={p.onBack}
          />
        </View>
      </View>
    );
  }

  if (p.error) {
    return (
      <View style={styles.canvas}>
        <Nav onBack={p.onBack} onMore={p.onMore} />
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
      <Nav onBack={p.onBack} onMore={p.onMore} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {p.loading ? (
          <View style={styles.titleSkel}>
            <Skeleton />
          </View>
        ) : (
          <View style={styles.coverWrap}>
            <Cover
              category={catalogCoverCategory(p.category)}
              title={p.title}
              days={p.durationDays}
              width={coverW}
              height={200}
            />
          </View>
        )}
        {p.finishedLine && !p.loading ? (
          <Text style={styles.finishedLine}>{p.finishedLine}</Text>
        ) : null}
        <Text style={styles.metaLine}>
          {[
            formatDays(p.durationDays),
            catalogCoverCategory(p.category),
            PARTICIPATION_LABEL[p.participationType],
            peopleChip ?? peopleLabel(p.participantsCount),
          ].join(" · ")}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}

        <Text style={styles.heading}>Every day</Text>
        {p.loading ? (
          <View style={styles.taskSkel}>
            <Skeleton />
            <Skeleton />
          </View>
        ) : (
          p.tasks.map((t, i) => {
            const Icon = TASK_ICON[t.task_type] ?? Circle;
            return (
              <View key={`${t.title}-${i}`}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.taskRow}>
                  <Icon size={ICON} color={DS_V3.color.textSecondary} />
                  <View style={styles.taskCopy}>
                    <Text style={styles.taskTitle}>{t.title}</Text>
                    <View style={styles.gateRow}>
                      {t.required === false ? (
                        <View style={[styles.gate, styles.gateMuted]}>
                          <Text style={styles.gateTextMuted}>Optional</Text>
                        </View>
                      ) : null}
                      <Text style={t.required === false ? styles.gateTextMuted : styles.gateText}>
                        {t.proof}
                        {t.time_window ? ` · ${t.time_window}` : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.heading}>People in it</Text>
        <Text style={styles.mode}>{peopleInIt(p.peopleNames, p.participantsCount)}</Text>
        <Text style={styles.mode}>{p.isHardMode ? MODE_STRICT_DETAIL : MODE_STANDARD_DETAIL}</Text>
        <View style={invited ? styles.footerClearInvited : styles.footerClear} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingTop: footerTop,
            paddingBottom: footerPad + insets.bottom,
          },
          closed ? styles.footerClosed : null,
          blocked ? styles.footerBlocked : null,
        ]}
      >
        {p.finishedLine ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={p.finishedCtaLabel ?? "Start again"}
            disabled={p.joining}
            onPress={p.joining ? undefined : p.onStartAgain}
            style={({ pressed }) => [styles.join, pressed ? styles.joinPressed : null]}
          >
            <Text style={styles.joinLabel}>{p.finishedCtaLabel ?? "Start again"}</Text>
          </Pressable>
        ) : closed ? (
          <Text style={styles.closedLine}>
            {p.state === "ended"
              ? `This challenge ended on ${p.endsOn}.`
              : `This challenge starts on ${p.startsOn}.`}
          </Text>
        ) : invited ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Accept"
              disabled={p.joining}
              onPress={p.joining ? undefined : p.onAccept}
              style={({ pressed }) => [styles.join, pressed ? styles.joinPressed : null]}
            >
              <Text style={styles.joinLabel}>Accept</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Not now"
              onPress={p.onNotNow}
              hitSlop={8}
            >
              <Text style={styles.notNow}>Not now</Text>
            </Pressable>
            <Text style={styles.joinCaption}>{invitedCaption(p.invite!.inviterName)}</Text>
          </>
        ) : inviteOnly ? (
          <Text style={styles.joinCaption}>{GROUP_INVITE_ONLY_CAPTION}</Text>
        ) : (
          <>
            {blocked ? (
              <View style={styles.joinWide}>
                <Button label="Join" disabled />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Join ${p.title}`}
                disabled={p.joining}
                onPress={p.joining ? undefined : p.onJoin}
                style={({ pressed }) => [styles.join, pressed ? styles.joinPressed : null]}
              >
                <Text style={styles.joinLabel}>{`Join ${p.title}`}</Text>
              </Pressable>
            )}
            {blocked ? (
              <>
                <Text style={styles.limitCaption}>
                  {`You're in ${p.activeCount} challenges, the Free limit.`}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Leave one, or upgrade"
                  onPress={p.onUpgrade}
                  hitSlop={8}
                >
                  <Text style={styles.upgrade}>Leave one or go Pro</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.joinCaption}>
                {joinCaption(p.participationType, undefined, undefined, deferDay1)}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function Nav({ onBack, onMore }: { onBack: () => void; onMore?: () => void }) {
  return (
    <View style={styles.nav}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.navHit}
      >
        <ChevronLeft size={24} color={DS_V3.color.textPrimary} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More"
        onPress={onMore}
        style={styles.navHit}
      >
        <Ellipsis size={24} color={DS_V3.color.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  nav: {
    height: DS_V3.size.tap,
    paddingLeft: DS_V3.space.gutter,
    paddingRight: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navHit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  coverWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
  },
  metaLine: {
    paddingTop: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  title: {
    paddingTop: 10,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  finishedLine: {
    paddingTop: 6,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  titleSkel: {
    paddingTop: 10,
    paddingHorizontal: DS_V3.space.gutter,
    height: DS_V3.type.title.lineHeight + 10,
  },
  description: {
    paddingTop: 6,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  chips: {
    paddingTop: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.sm,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: DS_V3.space.md,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  chipText: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  chipTextMuted: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  notNow: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  heading: {
    paddingTop: 18,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  divider: {
    height: PT,
    backgroundColor: DS_V3.color.border,
    marginHorizontal: DS_V3.space.gutter,
  },
  taskRow: {
    paddingVertical: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  taskCopy: {
    flex: 1,
    gap: DS_V3.space.sm,
  },
  taskTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskSkel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    gap: DS_V3.space.md,
  },
  gateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  gate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: DS_V3.space.sm,
    borderRadius: DS_V3.radius.input,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
  },
  gateMuted: {
    backgroundColor: DS_V3.color.surface,
  },
  gateText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  gateTextMuted: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  mode: {
    paddingTop: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footerClear: {
    height: FOOTER_CLEAR,
  },
  footerClearInvited: {
    height: FOOTER_CLEAR + DS_V3.size.tap,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DS_V3.color.canvas,
    borderTopWidth: PT,
    borderTopColor: DS_V3.color.border,
    paddingHorizontal: DS_V3.space.gutter,
    alignItems: "center",
    gap: 10,
  },
  footerClosed: {
    justifyContent: "center",
    gap: 0,
  },
  footerBlocked: {
    gap: DS_V3.space.sm,
  },
  joinWide: {
    width: "100%",
  },
  join: {
    width: "100%",
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  joinPressed: {
    opacity: 0.8,
  },
  joinLabel: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  joinCaption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  limitCaption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  upgrade: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  closedLine: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
});
