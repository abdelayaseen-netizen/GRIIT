/**
 * Frame 59 — streak is the hero; image area follows proof count; never an empty card.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { Download, Flame, Instagram, ShieldOff, Snowflake, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { ShareChoice } from "@/components/ds/ShareChoice";
import Card from "@/components/ds/Card";
import ShareImage from "@/components/share/ShareImage";
import { saveStickerToPhotos, shareToInstagramStory } from "@/lib/share";
import { facebookAppId, showStoryAction } from "@/lib/share-sticker";
import type { ShareCardInput } from "@/lib/share-image";
import { securedMomentTitle, streakInARow } from "@/lib/task-complete-toast";
import EmptyState from "@/components/ds/EmptyState";
import { ProofPhoto } from "@/components/ds/ProofFallbackTile";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import { SECURED_DONE } from "@/lib/simple-log";
import {
  PROOF_KEEP,
  PROOF_SHARE_FAILED,
} from "@/lib/proof-moment";
import {
  SECURED_LOAD_ERROR,
  SECURED_LOAD_RETRY,
  SECURED_PHOTO_H,
  SECURED_SELF,
  SECURED_TILE,
  SECURED_TILE_MAX,
  securedChallengeLine,
  securedDayCaption,
  securedOverflowLabel,
  type SecuredProof,
  type SecuredSelfRow,
} from "@/lib/secured-day";

const PT = DS_V3.space.xs / 4;
const TILE_GAP = 6;
const SCRIM = 0.62;
const ICON = DS_V3.space.lg;

export default function SecuredDayScreen({
  streak,
  proofs,
  selfReported,
  taskCount,
  challengeCount,
  allSelfReported,
  loadError,
  onRetryLoad,
  week,
  todayIndex,
  fillToday,
  offerShare,
  shareFailed,
  onShare,
  onKeep,
  onUndo,
  sharedNow,
  onDone,
  username,
  freezeNote,
}: {
  streak: number;
  proofs: SecuredProof[];
  selfReported: SecuredSelfRow[];
  taskCount?: number;
  challengeCount: number;
  allSelfReported?: boolean;
  loadError?: boolean;
  onRetryLoad?: () => void;
  week: WeekStripDay[];
  todayIndex: number;
  fillToday?: boolean;
  offerShare: boolean;
  shareFailed?: boolean;
  sharing?: boolean;
  onShare?: () => void;
  onKeep?: () => void;
  onUndo?: () => void;
  sharedNow?: boolean;
  onDone: () => void;
  username?: string | null;
  freezeNote?: string | null;
}) {
  const n = proofs.length;
  const overflow = securedOverflowLabel(n);
  const caption =
    taskCount == null
      ? ""
      : securedDayCaption({
          taskCount,
          challengeCount,
          cameraProofs: n,
          allSelfReported,
        });
  const names = [...new Set(proofs.map((p) => p.challengeName))].join(", ");
  const day = proofs[0]?.day ?? selfReported[0]?.day ?? null;
  const title = securedMomentTitle(challengeCount, day);
  const lines =
    challengeCount === 1
      ? []
      : [
          ...proofs.map((p) => securedChallengeLine(p.challengeName, p.day, p.length)),
          ...selfReported.map((row) => securedChallengeLine(row.name, row.day, row.length)),
        ];
  const previewPhoto = proofs[0]?.uri ?? null;
  const previewChallenge = proofs[0]?.challengeName ?? selfReported[0]?.name ?? "";
  const preview: ShareCardInput = {
    style: previewPhoto ? "A" : "C",
    colour: "ink",
    challenge: previewChallenge,
    day: day ?? undefined,
    photoUri: previewPhoto,
    cameraSeal: Boolean(previewPhoto),
    username,
    streak,
  };
  const showStory = showStoryAction(facebookAppId());
  const shot = React.useRef<ViewShot>(null);

  const capture = async () => {
    const uri = await shot.current?.capture?.();
    return typeof uri === "string" ? uri : null;
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: DS_V3.space.sm, paddingBottom: DS_V3.space.section * 4 },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onDone}
          style={styles.close}
        >
          <X size={DS_V3.space.lg + DS_V3.space.sm} color={DS_V3.color.textSecondary} />
        </Pressable>
        <View style={styles.hero}>
          <Flame size={28} color={DS_V3.color.brand} />
          <Text style={styles.hero88}>{streak}</Text>
          <Text style={styles.unit}>{streakInARow(streak)}</Text>
          {freezeNote ? (
            <View style={styles.freezeNote}>
              <Snowflake size={16} color={DS_V3.color.textSecondary} />
              <Text style={styles.caption}>{freezeNote}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.center}>
          <Text style={styles.today}>{title}</Text>
          {lines.map((line) => (
            <Text key={line} style={styles.caption}>{line}</Text>
          ))}
          {loadError ? (
            <EmptyState
              heading={SECURED_LOAD_ERROR}
              body="Check your connection and try again."
              actionLabel={SECURED_LOAD_RETRY}
              variant="error"
              onRetry={onRetryLoad}
            />
          ) : caption ? (
            <Text style={styles.caption}>{caption}</Text>
          ) : null}
        </View>
        <View style={styles.previewClip}>
          <View style={styles.previewScale}>
            <ShareImage input={preview} />
          </View>
        </View>
        <View style={styles.offscreen} pointerEvents="none">
          <ViewShot ref={shot} options={{ format: "png", quality: 1, result: "tmpfile" }}>
            <ShareImage input={preview} />
          </ViewShot>
        </View>
        <WeekStrip days={week} todayIndex={todayIndex} fillToday={fillToday} />
        {n === 0 && selfReported.length > 0 ? (
          <Card>
            {selfReported.map((c) => (
              <View key={c.name} style={styles.selfRow}>
                <ShieldOff size={ICON} color={DS_V3.color.textSecondary} />
                <Text style={styles.selfName}>{securedChallengeLine(c.name, c.day, c.length)}</Text>
                <Text style={styles.selfTag}>{SECURED_SELF}</Text>
              </View>
            ))}
          </Card>
        ) : n === 1 && proofs[0] ? (
          <>
            <ProofPhoto uri={proofs[0].uri} taskName={proofs[0].challengeName} style={styles.photo} />
            <Text style={styles.photoCap}>
              {securedChallengeLine(proofs[0].challengeName, proofs[0].day, proofs[0].length)}
            </Text>
          </>
        ) : n > 1 ? (
          <>
            <View style={styles.tiles}>
              {proofs.slice(0, SECURED_TILE_MAX).map((pr, i) => {
                const last = i === SECURED_TILE_MAX - 1 && overflow;
                return (
                  <View key={`${pr.uri}-${i}`} style={styles.tile}>
                    <ProofPhoto uri={pr.uri} taskName={pr.challengeName} style={styles.tileImg} />
                    {last ? (
                      <View style={styles.scrim} pointerEvents="none">
                        <View style={styles.scrimFill} />
                        <Text style={styles.plus}>{overflow}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
            <Text style={styles.photoCap}>{names}</Text>
          </>
        ) : null}
        {shareFailed ? <Text style={styles.fail}>{PROOF_SHARE_FAILED}</Text> : null}
      </ScrollView>
      <View style={[styles.footer, { bottom: DS_V3.space.gutter }]}>
        {offerShare ? (
          <>
            <ShareChoice
              state={sharedNow ? "shared" : shareFailed ? "failed" : "unanswered"}
              isPhoto
              photoUri={proofs[0]?.uri}
              onShare={() => onShare?.()}
              onKeep={() => onKeep?.()}
              onUndo={() => onUndo?.()}
              onRetry={() => onShare?.()}
            />
            {showStory ? (
              <Button
                label="Instagram Story"
                variant="secondary"
                icon={<Instagram size={18} color={DS_V3.color.textPrimary} />}
                onPress={() => {
                  void capture().then((uri) => {
                    if (uri) void shareToInstagramStory(uri);
                  });
                }}
              />
            ) : null}
            <Button
              label="Save"
              variant="secondary"
              icon={<Download size={18} color={DS_V3.color.textPrimary} />}
              onPress={() => {
                void capture().then((uri) => {
                  if (uri) void saveStickerToPhotos(uri);
                });
              }}
            />
            <Button label={PROOF_KEEP} variant="tertiary" onPress={onKeep} />
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
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  close: {
    minHeight: DS_V3.size.tap,
    minWidth: DS_V3.size.tap,
    alignSelf: "flex-end",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    gap: 2,
  },
  freezeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  hero88: {
    fontSize: 88,
    lineHeight: 88,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  previewClip: {
    width: 170,
    height: 302,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 16,
  },
  previewScale: {
    position: "absolute",
    width: 1080,
    height: 1920,
    left: (170 - 1080) / 2,
    top: (302 - 1920) / 2,
    transform: [{ scale: 170 / 1080 }],
  },
  offscreen: {
    position: "absolute",
    left: -4000,
    top: 0,
  },
  label: {
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
  center: {
    alignItems: "center",
    gap: 6,
  },
  today: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  photo: {
    width: "100%",
    height: SECURED_PHOTO_H,
    borderRadius: DS_V3.radius.card,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  photoCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  tiles: {
    flexDirection: "row",
    gap: TILE_GAP,
  },
  tile: {
    flex: 1,
    height: SECURED_TILE,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  tileImg: {
    width: "100%",
    height: "100%",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scrimFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.canvas,
    opacity: SCRIM,
  },
  plus: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  selfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selfName: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  selfTag: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  fail: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
