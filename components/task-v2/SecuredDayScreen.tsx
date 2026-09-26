/**
 * Frame 59 — streak is the hero; image area follows proof count; never an empty card.
 */
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowUpRight, ShieldOff, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import EmptyState from "@/components/ds/EmptyState";
import WeekStrip, { type WeekStripDay } from "@/components/ds/WeekStrip";
import { SECURED_DONE, SECURED_STREAK_LABEL } from "@/lib/simple-log";
import {
  PROOF_KEEP,
  PROOF_SHARE,
  PROOF_SHARE_FAILED,
} from "@/lib/proof-moment";
import {
  SECURED_LOAD_ERROR,
  SECURED_LOAD_RETRY,
  SECURED_PHOTO_H,
  SECURED_SELF,
  SECURED_TILE,
  SECURED_TILE_MAX,
  SECURED_TODAY,
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
  sharing,
  onShare,
  onKeep,
  onDone,
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
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
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

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + DS_V3.space.sm, paddingBottom: insets.bottom + DS_V3.space.section * 4 },
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
          <Text style={styles.label}>{SECURED_STREAK_LABEL}</Text>
          <DisplayNumber value={streak} size="moment" />
          <Text style={styles.unit}>{streak === 1 ? "day" : "days"}</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.today}>{SECURED_TODAY}</Text>
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
            <Image source={{ uri: proofs[0].uri }} style={styles.photo} resizeMode="cover" />
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
                    <Image source={{ uri: pr.uri }} style={styles.tileImg} resizeMode="cover" />
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
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        {offerShare ? (
          <>
            <Button
              label={PROOF_SHARE}
              submitting={sharing}
              icon={<ArrowUpRight size={DS_V3.space.gutter} color={DS_V3.color.onBrand} />}
              onPress={onShare}
            />
            <Button label={PROOF_KEEP} variant="secondary" onPress={onKeep} />
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
