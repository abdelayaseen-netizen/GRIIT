/**
 * MomentScreenV3 — frames 15 and 20, Secured / Self reported / Complete.
 * Variants map from pickConfirmationVariant A–D plus complete.
 */
import React, { useCallback, useRef, useState } from "react";
import { AccessibilityInfo, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Camera, ShieldOff } from "lucide-react-native";
import type ViewShot from "react-native-view-shot";
import { DS_V3 } from "@/lib/design-system";
import { getCurrentWeekDateKeys, getTodayDateKey } from "@/lib/date-utils";
import { shareProgressImage } from "@/lib/share";
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
  SECURED_TODAY_PROOF,
} from "@/lib/simple-log";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import { proofImageUrlForCheckIn } from "@/lib/profile-v2-proof-photo";
import Stamp from "@/components/ds/Stamp";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import ShareCardV3 from "@/components/share/ShareCardV3";
import ContactSheet, { type ContactSheetProof } from "./ContactSheet";

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

/** Mon–Sun strip from server date keys. Today is filled only when the key is present. */
export function weekFromSecuredKeys(
  keys: string[],
  timezone?: string | null
): { days: WeekStripDay[]; todayIndex: number } {
  const letters = ["M", "T", "W", "T", "F", "S", "S"];
  const weekKeys = getCurrentWeekDateKeys(timezone);
  const todayKey = getTodayDateKey(timezone);
  const idx = weekKeys.indexOf(todayKey);
  const fallback = weekFromToday();
  return {
    days: letters.map((letter, i) => ({
      letter,
      filled: keys.includes(weekKeys[i] ?? ""),
    })),
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
  if (args.variant === "complete") return `${args.target} days. Every one witnessed.`;
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
  proofUri?: string;
  proofSource?: number;
  proofs?: ContactSheetProof[];
  week?: WeekStripDay[];
  todayIndex?: number;
  fillToday?: boolean;
  onShare?: (uri: string) => void;
  onDone?: () => void;
  onNext?: () => void;
};

export default function MomentScreenV3({
  variant,
  streak,
  streakBefore,
  day = 1,
  remaining = 0,
  target,
  proofUri,
  proofSource,
  proofs,
  week,
  todayIndex = 0,
  fillToday: fillTodayProp,
  onShare,
  onDone,
  onNext,
}: MomentScreenV3Props) {
  const insets = useSafeAreaInsets();
  const shotRef = useRef<ViewShot>(null);
  const counts = isSecuredVariant(variant);
  const camera =
    variant === "verified" ||
    (counts &&
      variant !== "selfReported" &&
      (securedHasCameraProof({ proofUri: proofUri ?? null }) || proofSource != null));
  const justMoved = counts && streakBefore != null && streakBefore !== streak;
  const [stampOn, setStampOn] = useState(!justMoved && camera);
  const [completeStamp, setCompleteStamp] = useState(false);
  const weekToday = week ? todayIndex : weekFromToday().todayIndex;
  const fillToday = fillTodayProp ?? (justMoved && counts);
  const rawDays = week ?? weekFromToday().days;
  const weekDays = fillToday
    ? rawDays.map((d, i) => (i === weekToday ? { ...d, filled: false } : d))
    : rawDays;
  const goal = target ?? streak;
  const copy = stateLine({ variant, day, remaining, target: goal, camera });
  const shareCopy = variant === "complete" ? `${goal} days. Every one witnessed.` : copy;
  const shareLabel = variant === "complete" ? "Complete" : "Verified";
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

  const settleSheet = useCallback(() => {
    setCompleteStamp(true);
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!reduce) fireSuccessHaptic();
    });
  }, []);

  const share = useCallback(async () => {
    const uri = await shotRef.current?.capture?.();
    if (uri && onShare) {
      onShare(uri);
      return;
    }
    if (uri) {
      await shareProgressImage(uri, shareCopy);
    }
  }, [onShare, shareCopy]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View
        pointerEvents="none"
        style={styles.offscreen}
        accessibilityElementsHidden
      >
        <ShareCardV3
          ref={shotRef}
          size="story"
          streak={variant === "complete" ? goal : streak}
          copy={shareCopy}
          proofUri={proofUri}
          proofSource={proofSource}
          proofs={variant === "complete" ? proofs : undefined}
          label={shareLabel}
        />
      </View>
      {counts ? (
        <View style={[styles.block, { paddingTop: insets.top + DS_V3.space.md }]}>
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
          {camera ? (
            <View style={styles.photoFrame}>
              <ProofImage
                uri={proofImageUrlForCheckIn({ photo_url: proofUri })}
                source={proofSource}
                size="feed"
                title={hasPhoto ? undefined : SECURED_TODAY_PROOF}
                stamp={stampOn && hasPhoto ? "Verified" : false}
                scrim={stampOn && hasPhoto}
              />
            </View>
          ) : (
            <Text style={styles.keep}>{keepCount}</Text>
          )}
        </View>
      ) : (
        <>
          <View style={[styles.top, { paddingTop: insets.top + DS_V3.space.md }]}>
            <DisplayNumber
              value={variant === "complete" ? goal : streak}
              size={variant === "complete" ? "moment" : "mid"}
              animateFrom={justMoved ? streakBefore : undefined}
              onSettled={justMoved ? settleCount : undefined}
            />
            <Text style={styles.copy}>{copy}</Text>
          </View>
          {variant === "complete" ? (
            proofs && proofs.length > 0 ? (
              <View style={styles.media}>
                <ContactSheet proofs={proofs} target={goal} onRevealed={settleSheet} />
                {completeStamp ? (
                  <View style={styles.completeStamp}>
                    <Stamp label="Complete" onInk />
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.media}>
                {/* TODO(backend): proofs for contact sheet */}
                <View style={styles.completeStamp}>
                  <Stamp label="Complete" onInk />
                </View>
              </View>
            )
          ) : (
            <View style={styles.media} />
          )}
        </>
      )}
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        {variant === "complete" ? (
          <>
            <Button label="Start the next one" onPress={onNext} />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button label="Share" variant="secondary" onPress={() => void share()} />
              </View>
              <View style={styles.flex}>
                <Button label={SECURED_DONE} variant="tertiary" onPress={onDone} />
              </View>
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    top: 0,
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
  completeStamp: {
    marginTop: DS_V3.space.gutter,
    alignItems: "center",
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
