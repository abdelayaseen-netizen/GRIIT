/**
 * MomentScreenV3 — frames 15 and 20, Secured / Self reported / Complete.
 * Variants map from pickConfirmationVariant A–D plus complete.
 */
import React, { useCallback, useState } from "react";
import { AccessibilityInfo, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Camera, ShieldOff } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { getCurrentWeekDateKeys, getTodayDateKey } from "@/lib/date-utils";
import { buildWeekStripDays } from "@/lib/week-strip-days";
import type { SubmitResult } from "@/lib/task-completion-result";
import { pickConfirmationVariant } from "@/lib/task-completion-result";
import { taskWord } from "@/lib/active-challenge-ui";
import { moreDaysThisWeek, securedHasCameraProof } from "@/lib/secured-layout";
import {
  formatSecuredKeepCount,
  formatSecuredStateLine,
  SECURED_DONE,
  SECURED_PILL_CAMERA,
  SECURED_PILL_SELF,
  SECURED_STREAK_LABEL,
} from "@/lib/simple-log";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import ShareStickerSheet from "@/components/share/ShareStickerSheet";
import type { ContactSheetProof } from "./ContactSheet";

const PHOTO_FRAME = DS_V3.space.gutter * 12;
const CHIP_ICON = DS_V3.space.lg;
const PT = DS_V3.space.xs / 4;

export type MomentVariant = "verified" | "daySecured" | "tasksLeft" | "selfReported" | "complete";

export function momentVariantFromResult(result: SubmitResult): MomentVariant {
  const code = pickConfirmationVariant(result);
  if (code === "D") return "selfReported";
  if (code === "B") return "tasksLeft";
  if (code === "C") return "daySecured";
  return result.verificationKind === "live_photo" ? "verified" : "daySecured";
}

export function weekFromToday(): { days: WeekStripDay[]; todayIndex: number } {
  const letters = ["M", "T", "W", "T", "F", "S", "S"];
  const js = new Date().getDay();
  const todayIndex = js === 0 ? 6 : js - 1;
  return {
    days: letters.map((letter) => ({ letter, filled: false })),
    todayIndex,
  };
}

/** Mon–Sun strip from the same keys Home uses (secured / frozen / last stand). */
export function weekFromSecuredKeys(
  keys: string[],
  timezone?: string | null,
  marks?: {
    frozenDateKeys?: readonly string[];
    lastStandDateKeys?: readonly string[];
    todaySecured?: boolean;
  },
): { days: WeekStripDay[]; todayIndex: number } {
  const weekKeys = getCurrentWeekDateKeys(timezone);
  const todayKey = getTodayDateKey(timezone);
  const idx = weekKeys.indexOf(todayKey);
  const fallback = weekFromToday();
  return {
    days: buildWeekStripDays(weekKeys, {
      securedDateKeys: keys,
      frozenDateKeys: marks?.frozenDateKeys ?? [],
      lastStandDateKeys: marks?.lastStandDateKeys ?? [],
      todayKey,
      todaySecured: marks?.todaySecured === true,
    }),
    todayIndex: idx >= 0 ? idx : fallback.todayIndex,
  };
}

function isSecuredVariant(variant: MomentVariant): boolean {
  return variant === "verified" || variant === "daySecured" || variant === "selfReported";
}

function stateLine(args: {
  variant: MomentVariant;
  day: number;
  remaining: number;
  target: number;
  camera: boolean;
}): string {
  if (isSecuredVariant(args.variant)) return formatSecuredStateLine(args.day, args.camera);
  if (args.variant === "tasksLeft") return `${args.remaining} ${taskWord(args.remaining)} left.`;
  if (args.variant === "complete") return `of ${args.target} days secured`;
  return "Day secured.";
}

function fireSuccessHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export type MomentScreenV3Props = {
  variant: MomentVariant;
  streak: number;
  streakBefore?: number;
  day?: number;
  remaining?: number;
  target?: number;
  challengeName?: string;
  proofUri?: string;
  proofSource?: number;
  proofs?: ContactSheetProof[];
  week?: WeekStripDay[];
  todayIndex?: number;
  fillToday?: boolean;
  onShare?: (uri: string) => void;
  onDone?: () => void;
  onNext?: () => void;
  /** Enrollment record. Absent until challenges.finishRecord returns. */
  securedDays?: number;
  longestStreak?: number;
  heldDays?: number;
  numbersReady?: boolean;
};

export default function MomentScreenV3({
  variant,
  streak,
  streakBefore,
  day = 1,
  remaining = 0,
  target,
  challengeName,
  proofUri,
  proofSource,
  week,
  todayIndex = 0,
  fillToday: fillTodayProp,
  onDone,
  onNext,
  securedDays = 0,
  longestStreak = 0,
  heldDays = 0,
  numbersReady = false,
}: MomentScreenV3Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const counts = isSecuredVariant(variant);
  const camera =
    variant === "verified" ||
    (counts &&
      variant !== "selfReported" &&
      (securedHasCameraProof({ proofUri: proofUri ?? null }) || proofSource != null));
  const justMoved = counts && streakBefore != null && streakBefore !== streak;
  const [stampOn, setStampOn] = useState(!justMoved && camera);
  const weekToday = week ? todayIndex : weekFromToday().todayIndex;
  const fillToday = fillTodayProp ?? (justMoved && counts);
  const rawDays = week ?? weekFromToday().days;
  const weekDays = fillToday
    ? rawDays.map((d, i) => (i === weekToday ? { ...d, filled: false } : d))
    : rawDays;
  const goal = target ?? streak;
  const copy = stateLine({ variant, day, remaining, target: goal, camera });
  const hasPhoto = proofSource != null || Boolean(proofUri);
  const keepCount = formatSecuredKeepCount(moreDaysThisWeek(weekToday));

  const settleCount = useCallback(() => {
    if (camera) {
      setStampOn(true);
      if (justMoved) {
        void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
          if (!reduce) fireSuccessHaptic();
        });
      }
    }
  }, [camera, justMoved]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {counts ? (
        <View style={[styles.block, { paddingTop: DS_V3.space.md }]}>
          <Text style={styles.streakLabel}>{SECURED_STREAK_LABEL}</Text>
          <DisplayNumber
            value={streak}
            size="mid"
            animateFrom={justMoved ? streakBefore : undefined}
            onSettled={justMoved ? settleCount : undefined}
          />
          <Text style={styles.unit}>{streak === 1 ? "day" : "days"}</Text>
          <Text style={styles.copy}>{copy}</Text>
          <Chip
            variant="form"
            label={camera ? SECURED_PILL_CAMERA : SECURED_PILL_SELF}
            icon={
              camera ? (
                <Camera size={CHIP_ICON} color={DS_V3.color.textSecondary} />
              ) : (
                <ShieldOff size={CHIP_ICON} color={DS_V3.color.textSecondary} />
              )
            }
          />
          <WeekStrip days={weekDays} todayIndex={weekToday} fillToday={fillToday} />
          {camera && hasPhoto ? (
            <View style={styles.photoFrame}>
              <ProofImage
                uri={proofUri}
                source={proofSource}
                size="feed"
                stamp={stampOn ? "Photo" : false}
                scrim={stampOn}
              />
            </View>
          ) : (
            <Text style={styles.keep}>{keepCount}</Text>
          )}
        </View>
      ) : (
        <>
          <View style={[styles.top, { paddingTop: DS_V3.space.md }]}>
            {variant === "complete" ? (
              <Text style={styles.finishName}>
                {(challengeName?.trim() || "Challenge")} · finished
              </Text>
            ) : null}
            {variant !== "complete" || numbersReady ? (
              <DisplayNumber
                value={variant === "complete" ? securedDays : streak}
                size={variant === "complete" ? "moment" : "mid"}
                animateFrom={justMoved ? streakBefore : undefined}
                onSettled={justMoved ? settleCount : undefined}
              />
            ) : null}
            {variant !== "complete" || numbersReady ? <Text style={styles.copy}>{copy}</Text> : null}
          </View>
          {variant === "complete" && numbersReady ? (
            <View style={styles.finishStats}>
              <FinishStat value={longestStreak} label="Longest streak" />
              <FinishStat value={heldDays} label="Held" />
              <FinishStat value={securedDays + heldDays} label="Days done" />
            </View>
          ) : variant === "complete" ? (
            <View style={styles.media} />
          ) : (
            <View style={styles.media} />
          )}
        </>
      )}
      <View style={[styles.footer, { bottom: DS_V3.space.gutter }]}>
        {variant === "complete" ? (
          <>
            <Button label="Share the finish" onPress={() => setSheetOpen(true)} disabled={!numbersReady} />
            <Button label="See the record" variant="tertiary" onPress={onDone ?? onNext} />
          </>
        ) : variant === "tasksLeft" ? (
          <>
            <WeekStrip days={weekDays} todayIndex={weekToday} fillToday={fillToday} fillMs={300} />
            <Button label="Next task" onPress={onNext ?? onDone} />
          </>
        ) : (
          <Button label={SECURED_DONE} onPress={onDone} />
        )}
      </View>
      <ShareStickerSheet
        visible={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        variant="day"
        moment={variant === "complete" ? "challenge_finished" : camera ? "photo_proof" : "self_reported"}
        streak={variant === "complete" ? longestStreak : streak}
        longestStreak={variant === "complete" ? longestStreak : undefined}
        day={{
          challenge: challengeName?.trim() || copy,
          day,
          durationDays: goal,
          secured: variant === "complete" ? securedDays : undefined,
          proof: camera ? "camera" : "self",
          photoUri: proofUri,
          photoShared: false,
        }}
      />
    </View>
  );
}

function FinishStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.finishStat}>
      <Text style={styles.finishStatValue}>{value}</Text>
      <Text style={styles.finishStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  block: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.size.button + DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  top: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.xs,
  },
  finishName: {
    ...DS_V3.type.secondary,
    color: DS_V3.color.textSecondary,
  },
  finishStats: {
    marginHorizontal: DS_V3.space.gutter,
    marginTop: DS_V3.space.md,
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: 14,
    flexDirection: "row",
    gap: 8,
  },
  finishStat: { flex: 1 },
  finishStatValue: {
    fontFamily: DS_V3.type.number.fontFamily,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  finishStatLabel: {
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
  },
  streakLabel: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  unit: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  copy: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  keep: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  photoFrame: {
    height: PHOTO_FRAME,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
  },
  media: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.size.button * 3,
    justifyContent: "flex-start",
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  row: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  flex: {
    flex: 1,
  },
});
