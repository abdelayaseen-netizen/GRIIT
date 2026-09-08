/**
 * Challenge detail, not joined — frame 29. Presentation only.
 * Copy from griit_brand/briefs/15/cursor/02_screens.md. DS_V3 tokens, no hex.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Camera,
  ChevronLeft,
  Circle,
  Clock,
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
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";
import Skeleton from "@/components/ds/Skeleton";
import type {
  ChallengeDetailTask,
  DetailState,
  GateKind,
  ParticipationType,
} from "@/lib/challenge-detail-mapping";

const PT = DS_V3.space.xs / 4;
const ICON = 22;
const GATE_ICON = 12;
const GATE_ORDER: GateKind[] = ["camera", "time_window", "location"];
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

const GATE_GLYPH: Record<GateKind, LucideIcon> = {
  camera: Camera,
  time_window: Clock,
  location: MapPin,
};

const PARTICIPATION_LABEL: Record<ParticipationType, string> = {
  solo: "Solo",
  duo: "Duo",
  team: "Team",
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
  onBack: () => void;
  onMore?: () => void;
  onJoin?: () => void;
  onUpgrade?: () => void;
  onRetry?: () => void;
};

function peopleLabel(n: number): string {
  return n === 1 ? "1 person" : `${n} people`;
}

function GateLabel({
  gate,
  window,
  muted,
}: {
  gate?: GateKind;
  window?: string;
  muted?: boolean;
}) {
  const Glyph = gate ? GATE_GLYPH[gate] : null;
  const label =
    gate === "camera"
      ? "Camera"
      : gate === "time_window"
        ? `Time window ${window ?? ""}`.trim()
        : gate === "location"
          ? "Location"
          : "Self-reported";
  return (
    <View style={[styles.gate, muted ? styles.gateMuted : null]}>
      {Glyph ? <Glyph size={GATE_ICON} color={DS_V3.color.textPrimary} /> : null}
      <Text style={muted ? styles.gateTextMuted : styles.gateText}>{label}</Text>
    </View>
  );
}

export default function ChallengeDetailV3(p: ChallengeDetailV3Props) {
  const insets = useSafeAreaInsets();
  const closed = p.state === "ended" || p.state === "not_live";
  const blocked = p.state === "free_limit";
  const description = (p.description ?? "").trim();
  const footerPad = blocked ? 24 : 28;
  const footerTop = blocked ? 14 : DS_V3.space.lg;

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
          <Text style={styles.title}>{p.title}</Text>
        )}
        {description ? <Text style={styles.description}>{description}</Text> : null}

        <View style={styles.chips}>
          <FactChip label={formatDays(p.durationDays)} />
          <FactChip label={PARTICIPATION_LABEL[p.participationType]} />
          <FactChip label={peopleLabel(p.participantsCount)} />
        </View>

        <Text style={styles.heading}>What you'll post</Text>
        {p.loading ? (
          <View style={styles.taskSkel}>
            <Skeleton />
            <Skeleton />
          </View>
        ) : (
          p.tasks.map((t, i) => {
            const Icon = TASK_ICON[t.task_type] ?? Circle;
            const shown = GATE_ORDER.filter((g) => t.gates.includes(g));
            return (
              <View key={`${t.title}-${i}`}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.taskRow}>
                  <Icon size={ICON} color={DS_V3.color.textSecondary} />
                  <View style={styles.taskCopy}>
                    <Text style={styles.taskTitle}>{t.title}</Text>
                    <View style={styles.gateRow}>
                      {shown.length
                        ? shown.map((g) => (
                            <GateLabel key={g} gate={g} window={t.time_window} />
                          ))
                        : <GateLabel muted />}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.mode}>
          {p.isHardMode
            ? "Hard mode. Gates are enforced; a failed gate fails the day."
            : "Standard mode. Gates are recorded, not enforced."}
        </Text>
        <View style={styles.footerClear} />
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
        {closed ? (
          <Text style={styles.closedLine}>
            {p.state === "ended"
              ? `This challenge ended on ${p.endsOn}.`
              : `This challenge starts on ${p.startsOn}.`}
          </Text>
        ) : (
          <>
            {blocked ? (
              <View style={styles.joinWide}>
                <Button label="Join" disabled />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Join"
                disabled={p.joining}
                onPress={p.joining ? undefined : p.onJoin}
                style={({ pressed }) => [styles.join, pressed ? styles.joinPressed : null]}
              >
                <Text style={styles.joinLabel}>Join</Text>
              </Pressable>
            )}
            {blocked ? (
              <>
                <Text style={styles.limitCaption}>
                  You are in {p.activeCount} challenges. Free accounts hold {p.freeLimit} at a time.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Leave one, or upgrade"
                  onPress={p.onUpgrade}
                  hitSlop={8}
                >
                  <Text style={styles.upgrade}>Leave one, or upgrade</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.joinCaption}>
                {p.participationType === "solo"
                  ? "Day 1 is today."
                  : "Join opens the invite step. You need a partner before Day 1."}
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

function FactChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
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
  title: {
    paddingTop: 10,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
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
    color: DS_V3.color.brandText,
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
