import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { DS_COLORS } from "@/lib/design-system";
import { BASE_COLORS } from "@/constants/theme";

/** Fixed size for consistent image capture (e.g. 1080x1080 for stories). */
export const SHARE_CARD_WIDTH = 400;
export const SHARE_CARD_HEIGHT = 500;

/** Proof certificate share card: 1080×1080, Instagram-optimized. */
export const PROOF_CARD_SIZE = 1080;

export interface ShareCardProofProps {
  username: string;
  dayNumber: number;
  challengeName: string;
  proofPhotoUri?: string | null;
  streakCount: number;
  gpsCoords?: string | null;
  date: string;
}

/**
 * Proof completion certificate for sharing. Renders as a View for react-native-view-shot capture.
 */
export function ProofShareCard({
  username,
  dayNumber,
  challengeName,
  proofPhotoUri,
  streakCount,
  gpsCoords,
  date,
}: ShareCardProofProps) {
  return (
    <View style={[proofStyles.card, { width: PROOF_CARD_SIZE, height: PROOF_CARD_SIZE }]}>
      <Text style={proofStyles.wordmark}>GRIIT</Text>
      <View style={proofStyles.center}>
        {proofPhotoUri ? (
          <>
            <Image source={{ uri: proofPhotoUri }} style={proofStyles.photo} resizeMode="cover" />
            <View style={proofStyles.photoOverlay} />
          </>
        ) : null}
        <View style={proofStyles.centerContent}>
          {proofPhotoUri ? null : (
            <Text style={proofStyles.streakBig}>{streakCount}</Text>
          )}
          <Text style={proofStyles.username}>{username}</Text>
          <Text style={proofStyles.dayComplete}>Day {dayNumber} Complete</Text>
        </View>
      </View>
      <View style={proofStyles.bottomStrip}>
        <Text style={proofStyles.bottomText}>{date}</Text>
        <Text style={proofStyles.bottomText} numberOfLines={1}>{challengeName}</Text>
        {gpsCoords ? <Text style={proofStyles.gps}>{gpsCoords}</Text> : null}
      </View>
      <Text style={proofStyles.brand}>GRIIT.APP</Text>
    </View>
  );
}

const proofStyles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.SHARE_CARD_BG,
    overflow: "hidden",
  },
  wordmark: {
    position: "absolute",
    top: 48,
    left: 48,
    fontSize: 36,
    fontWeight: "800",
    color: DS_COLORS.ACCENT_PRIMARY,
    letterSpacing: 2,
    zIndex: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  centerContent: {
    alignItems: "center",
    zIndex: 1,
  },
  streakBig: {
    fontSize: 120,
    fontWeight: "800",
    color: DS_COLORS.WHITE,
    marginBottom: 16,
  },
  username: {
    fontSize: 32,
    fontWeight: "700",
    color: DS_COLORS.WHITE,
    marginBottom: 8,
  },
  dayComplete: {
    fontSize: 28,
    fontWeight: "700",
    color: DS_COLORS.ACCENT_PRIMARY,
  },
  bottomStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    maxWidth: "60%",
  },
  gps: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  brand: {
    position: "absolute",
    bottom: 20,
    right: 24,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
});

export type ShareCardType = "progress" | "completion" | "milestone";

export interface ShareCardProps {
  type?: ShareCardType;
  streakCount: number;
  challengeName?: string;
  dayLabel?: string;
  tier?: string;
  /** For type 'completion': total days in the challenge. */
  totalDays?: number;
  /** For type 'milestone': e.g. "7-Day Streak", "30-Day Legend". */
  milestoneName?: string;
}

/**
 * Shareable progress card for social. Render inside a View with ref for capture via react-native-view-shot.
 */
export function ShareCard({
  type = "progress",
  streakCount,
  challengeName,
  dayLabel,
  tier,
  totalDays,
  milestoneName,
}: ShareCardProps) {
  if (type === "completion") {
    return (
      <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
        <Text style={[styles.wordmark, styles.completionBadge]}>CHALLENGE COMPLETE</Text>
        {challengeName ? <Text style={styles.challengeNameCompletion} numberOfLines={2}>{challengeName}</Text> : null}
        <View style={styles.streakWrap}>
          <Text style={styles.streakNumber}>{totalDays ?? streakCount}</Text>
          <Text style={styles.streakLabel}>days secured</Text>
        </View>
        <View style={styles.streakWrap}>
          <Text style={[styles.streakNumber, { fontSize: 36 }]}>{streakCount}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        {tier ? (
          <View style={[styles.tierBadge, { backgroundColor: DS_COLORS.accent }]}>
            <Text style={styles.tierText}>{tier}</Text>
          </View>
        ) : null}
        <Text style={styles.cta}>Join me on GRIIT</Text>
        <Text style={styles.url}>griit.app</Text>
      </View>
    );
  }
  if (type === "milestone") {
    return (
      <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
        <Text style={styles.wordmark}>GRIIT</Text>
        <Text style={[styles.challengeName, { marginBottom: 16 }]}>{milestoneName ?? `${streakCount}-Day Streak`}</Text>
        <View style={styles.streakWrap}>
          <Text style={styles.streakNumber}>{streakCount}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <Text style={styles.cta}>Join me on GRIIT</Text>
        <Text style={styles.url}>griit.app</Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }]}>
      <Text style={styles.wordmark}>GRIIT</Text>
      <View style={styles.streakWrap}>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
      {challengeName ? <Text style={styles.challengeName} numberOfLines={2}>{challengeName}</Text> : null}
      {dayLabel ? <Text style={styles.dayLabel}>{dayLabel}</Text> : null}
      {tier ? (
        <View style={[styles.tierBadge, { backgroundColor: DS_COLORS.accent }]}>
          <Text style={styles.tierText}>{tier}</Text>
        </View>
      ) : null}
      <Text style={styles.cta}>Join me on GRIIT</Text>
      <Text style={styles.url}>griit.app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 24,
  },
  streakWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: "800",
    color: DS_COLORS.accent,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: DS_COLORS.textSecondary,
    marginTop: 4,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 15,
    color: DS_COLORS.textSecondary,
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  tierText: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.WHITE,
  },
  cta: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.accent,
    marginBottom: 8,
  },
  url: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
  completionBadge: {
    fontSize: 16,
    letterSpacing: 2,
    color: DS_COLORS.success,
  },
  challengeNameCompletion: {
    fontSize: 22,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
});
