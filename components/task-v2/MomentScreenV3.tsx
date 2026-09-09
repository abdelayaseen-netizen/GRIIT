/**
 * MomentScreenV3 — frames 15 and 20, Secured / Self reported / Complete.
 * Variants map from pickConfirmationVariant A–D plus complete.
 */
import React, { useCallback, useRef, useState } from "react";
import { AccessibilityInfo, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import type ViewShot from "react-native-view-shot";
import { DS_V3 } from "@/lib/design-system";
import { shareProgressImage } from "@/lib/share";
import type { SubmitResult } from "@/lib/task-completion-result";
import { pickConfirmationVariant } from "@/lib/task-completion-result";
import Button from "@/components/ds/Button";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import Stamp from "@/components/ds/Stamp";
import WeekStrip from "@/components/shared/WeekStrip";
import ShareCardV3 from "@/components/share/ShareCardV3";
import ContactSheet, { type ContactSheetProof } from "./ContactSheet";

export type MomentVariant = "verified" | "daySecured" | "tasksLeft" | "selfReported" | "complete";

export function momentVariantFromResult(result: SubmitResult): MomentVariant {
  const code = pickConfirmationVariant(result);
  if (code === "D") return "selfReported";
  if (code === "B") return "tasksLeft";
  if (code === "C") return "daySecured";
  return result.verificationKind === "live_photo" ? "verified" : "daySecured";
}

export function weekFromToday(): { secured: boolean[]; todayIndex: number } {
  const js = new Date().getDay();
  const todayIndex = js === 0 ? 6 : js - 1;
  return {
    secured: [false, false, false, false, false, false, false],
    todayIndex,
  };
}

function stateLine(args: {
  variant: MomentVariant;
  day: number;
  remaining: number;
  target: number;
}): string {
  if (args.variant === "verified") return `Day ${args.day}. Verified.`;
  if (args.variant === "selfReported") return `Day ${args.day}. Self reported.`;
  if (args.variant === "tasksLeft") return `${args.remaining} tasks left.`;
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
  week?: boolean[];
  todayIndex?: number;
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
  onShare,
  onDone,
  onNext,
}: MomentScreenV3Props) {
  const insets = useSafeAreaInsets();
  const shotRef = useRef<ViewShot>(null);
  const counts = variant === "verified" || variant === "daySecured";
  const justMoved = counts && streakBefore != null && streakBefore !== streak;
  const [stampOn, setStampOn] = useState(!justMoved && (variant === "verified" || variant === "daySecured"));
  const [completeStamp, setCompleteStamp] = useState(false);
  const weekDays = week ?? weekFromToday().secured;
  const weekToday = week ? todayIndex : weekFromToday().todayIndex;
  const fillToday = justMoved && (variant === "verified" || variant === "daySecured");
  const goal = target ?? streak;
  const copy = stateLine({ variant, day, remaining, target: goal });
  const shareCopy = variant === "complete" ? `${goal} days. Every one witnessed.` : copy;
  const shareLabel = variant === "complete" ? "Complete" : "Verified";
  const showProofCard = Boolean(proofUri) || proofSource != null;

  const settleCount = useCallback(() => {
    if (variant === "verified" || variant === "daySecured") {
      setStampOn(true);
      if (justMoved) {
        void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
          if (!reduce) fireSuccessHaptic();
        });
      }
    }
  }, [variant, justMoved]);

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
      <View style={[styles.top, { paddingTop: insets.top + DS_V3.space.md }]}>
        <DisplayNumber
          value={variant === "complete" ? goal : streak}
          size="moment"
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
        <View style={styles.media}>
          {showProofCard ? (
            <ProofImage
              uri={proofUri}
              source={proofSource}
              size="feed"
              stamp={stampOn && (variant === "verified" || variant === "daySecured") ? "Verified" : false}
              scrim={stampOn && (variant === "verified" || variant === "daySecured")}
            />
          ) : null}
        </View>
      )}
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        {variant !== "complete" ? (
          <WeekStrip secured={weekDays} todayIndex={weekToday} fillToday={fillToday} />
        ) : null}
        {variant === "complete" ? (
          <>
            <Button label="Start the next one" onPress={onNext} />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Button label="Share" variant="secondary" onPress={() => void share()} />
              </View>
              <View style={styles.flex}>
                <Button label="Done" variant="tertiary" onPress={onDone} />
              </View>
            </View>
          </>
        ) : variant === "tasksLeft" ? (
          <Button label="Next task" onPress={onNext ?? onDone} />
        ) : variant === "selfReported" ? (
          <Button label="Done" variant="tertiary" ink onPress={onDone} />
        ) : (
          <>
            <Button label="Share" onPress={() => void share()} />
            <Button label="Done" variant="tertiary" ink onPress={onDone} />
          </>
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
  top: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.xs,
  },
  copy: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
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
