import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { GRIIT_COLORS, DS_RADIUS, DS_COLORS } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";

interface ProofShareCardProps {
  userName: string;
  challengeTitle: string;
  dayNumber: number;
  totalDays: number;
  streakCount: number;
  proofPhotoUri?: string;
  onDismiss: () => void;
  onShared?: () => void;
}

export default function ProofShareCard({
  userName,
  challengeTitle,
  dayNumber,
  totalDays,
  streakCount,
  proofPhotoUri,
  onDismiss,
  onShared,
}: ProofShareCardProps) {
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleShare = async () => {
    setSharing(true);
    setErrorMessage(null);
    try {
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error("Capture returned null");

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setErrorMessage("Sharing is not available on this device.");
        setSharing(false);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Day ${dayNumber} of ${challengeTitle} — GRIIT`,
        UTI: "public.png",
      });

      onShared?.();
      onDismiss();
    } catch (e) {
      captureError(e, { context: "ProofShareCard share" });
      setErrorMessage("Could not share. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ViewShot ref={shotRef} options={{ format: "png", quality: 0.95 }}>
          <View style={styles.card}>
            <Text style={styles.wordmark}>G R I I T</Text>

            <View style={styles.dayBadge}>
              <Text style={styles.dayNumber}>Day {dayNumber}</Text>
              <Text style={styles.dayOf}>of {totalDays}</Text>
            </View>

            <Text style={styles.challengeTitle}>{challengeTitle}</Text>
            <Text style={styles.userName}>@{userName}</Text>

            {proofPhotoUri ? (
              <Image
                source={{ uri: proofPhotoUri }}
                style={styles.proofThumb}
                cachePolicy="memory-disk"
                accessibilityLabel="Proof photo"
                accessibilityIgnoresInvertColors
              />
            ) : null}

            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>Current streak</Text>
              <Text style={styles.streakCount}>{streakCount} days</Text>
            </View>

            <Text style={styles.cta}>Join me on GRIIT</Text>
            <Text style={styles.ctaSub}>griit.fit</Text>
          </View>
        </ViewShot>

        {errorMessage ? (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void handleShare()}
          disabled={sharing}
          style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Share your proof to Instagram, TikTok, or other apps"
          accessibilityState={{ disabled: sharing }}
        >
          <Text style={styles.shareBtnText}>{sharing ? "Preparing..." : "Share your proof"}</Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Skip sharing"
        >
          <Text style={styles.skipBtnText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DS_COLORS.overlayDarker,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  container: {
    width: "88%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: DS_COLORS.black,
    borderRadius: DS_RADIUS.card,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  wordmark: {
    fontSize: 13,
    letterSpacing: 6,
    color: GRIIT_COLORS.primaryAccent,
    fontWeight: "600",
    marginBottom: 20,
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 52,
    fontWeight: "700",
    color: DS_COLORS.white,
    lineHeight: 56,
  },
  dayOf: {
    fontSize: 18,
    color: DS_COLORS.grayMuted,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.white,
    textAlign: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 13,
    color: DS_COLORS.grayMuted,
    marginBottom: 12,
  },
  proofThumb: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: DS_COLORS.photoThumbBg,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.borderAlt,
    marginBottom: 20,
  },
  streakLabel: {
    fontSize: 13,
    color: DS_COLORS.grayMuted,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: "600",
    color: GRIIT_COLORS.primaryAccent,
  },
  cta: {
    fontSize: 14,
    color: DS_COLORS.grayMuted,
  },
  ctaSub: {
    fontSize: 12,
    color: GRIIT_COLORS.primaryAccent,
    marginTop: 2,
  },
  error: {
    color: DS_COLORS.errorText,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  shareBtn: {
    width: "100%",
    backgroundColor: GRIIT_COLORS.primaryAccent,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  shareBtnDisabled: {
    opacity: 0.6,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.white,
  },
  skipBtn: {
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  skipBtnText: {
    fontSize: 14,
    color: DS_COLORS.grayMuted,
  },
});
