import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { shareToInstagramStory } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import {
  StatementCard,
  TransparentCard,
  ProofPhotoCard,
  DayRecapCard,
  ChallengeCompleteCard,
  MinimalStreakCard,
  SHARE_CARD_DIMENSIONS,
  type StatementCardProps,
  type TransparentCardProps,
  type ProofPhotoCardProps,
  type DayRecapCardProps,
  type ChallengeCompleteCardProps,
  type MinimalStreakCardProps,
} from "@/components/share/ShareCards";

export type ShareSheetCardKey = "Statement" | "Transparent" | "Proof" | "Recap" | "Complete" | "Streak";

type CardOption = {
  key: ShareSheetCardKey;
  label: string;
  ref: React.RefObject<ViewShot | null>;
};

const hints: Record<ShareSheetCardKey, string> = {
  Statement: "Bold dark card — works great as a feed post or story",
  Transparent: "Copy and paste as a sticker on your IG Story",
  Proof: "Your proof photo with verification badges",
  Recap: "Full receipt of today's completed tasks",
  Complete: "Challenge completion announcement",
  Streak: "Clean minimal streak — share anywhere",
};

const CHECKER = 14;

function CheckerBackground() {
  const rows = 24;
  const cols = 18;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const light = (r + c) % 2 === 0;
      cells.push(
        <View
          key={`${r}-${c}`}
          style={[
            styles.checkerCell,
            {
              left: c * CHECKER,
              top: r * CHECKER,
              backgroundColor: light ? DS_COLORS.SHARE_SHEET_CHECKER_LIGHT : DS_COLORS.SHARE_SHEET_CHECKER_DARK,
            },
          ]}
        />
      );
    }
  }
  return <View style={styles.checkerWrap}>{cells}</View>;
}

export type ShareSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  shareRef: React.RefObject<ViewShot | null>;
  transparentCardRef: React.RefObject<ViewShot | null>;
  proofCardRef: React.RefObject<ViewShot | null>;
  recapCardRef: React.RefObject<ViewShot | null>;
  completeCardRef: React.RefObject<ViewShot | null>;
  minimalStreakCardRef: React.RefObject<ViewShot | null>;
  hasPhoto: boolean;
  isAllDayComplete: boolean;
  isChallengeComplete: boolean;
  statementProps: StatementCardProps;
  transparentProps: TransparentCardProps;
  proofProps: ProofPhotoCardProps;
  recapProps: DayRecapCardProps;
  completeProps: ChallengeCompleteCardProps;
  minimalProps: MinimalStreakCardProps;
  completionId?: string;
};

export function ShareSheetModal({
  visible,
  onClose,
  shareRef,
  transparentCardRef,
  proofCardRef,
  recapCardRef,
  completeCardRef,
  minimalStreakCardRef,
  hasPhoto,
  isAllDayComplete,
  isChallengeComplete,
  statementProps,
  transparentProps,
  proofProps,
  recapProps,
  completeProps,
  minimalProps,
  completionId,
}: ShareSheetModalProps) {
  const [selected, setSelected] = useState<ShareSheetCardKey>("Statement");
  const [busy, setBusy] = useState(false);
  const [inlineMsg, setInlineMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!inlineMsg) return;
    const t = setTimeout(() => setInlineMsg(null), 3000);
    return () => clearTimeout(t);
  }, [inlineMsg]);

  const cards: CardOption[] = useMemo(
    () =>
      (
        [
          { key: "Statement" as const, label: "Statement", ref: shareRef },
          { key: "Transparent" as const, label: "Transparent", ref: transparentCardRef },
          { key: "Proof" as const, label: "Proof", ref: proofCardRef },
          { key: "Recap" as const, label: "Recap", ref: recapCardRef },
          { key: "Complete" as const, label: "Complete", ref: completeCardRef },
          { key: "Streak" as const, label: "Streak", ref: minimalStreakCardRef },
        ] satisfies CardOption[]
      ).filter((c) => {
        if (c.key === "Proof") return hasPhoto;
        if (c.key === "Recap") return isAllDayComplete;
        if (c.key === "Complete") return isChallengeComplete;
        return true;
      }),
    [shareRef, transparentCardRef, proofCardRef, recapCardRef, completeCardRef, minimalStreakCardRef, hasPhoto, isAllDayComplete, isChallengeComplete]
  );

  useEffect(() => {
    if (!visible || cards.length === 0) return;
    const still = cards.some((c) => c.key === selected);
    if (!still) setSelected(cards[0]!.key);
  }, [visible, cards, selected]);

  const previewScale = useMemo(() => {
    const { width, height } = Dimensions.get("window");
    const maxW = width - DS_SPACING.lg * 2;
    const maxH = height * 0.42;
    const sx = maxW / SHARE_CARD_DIMENSIONS.width;
    const sy = maxH / SHARE_CARD_DIMENSIONS.height;
    return Math.min(sx, sy, 0.22);
  }, [visible]);

  const renderPreviewCard = () => {
    switch (selected) {
      case "Statement":
        return <StatementCard {...statementProps} />;
      case "Transparent":
        return <TransparentCard {...transparentProps} />;
      case "Proof":
        return <ProofPhotoCard {...proofProps} />;
      case "Recap":
        return <DayRecapCard {...recapProps} />;
      case "Complete":
        return <ChallengeCompleteCard {...completeProps} />;
      case "Streak":
        return <MinimalStreakCard {...minimalProps} />;
      default:
        return <StatementCard {...statementProps} />;
    }
  };

  const getRefForSelected = (): React.RefObject<ViewShot | null> | null => {
    const opt = cards.find((c) => c.key === selected);
    return opt?.ref ?? null;
  };

  const captureSelectedUri = async (): Promise<string | null> => {
    const ref = getRefForSelected();
    const uri = await ref?.current?.capture?.();
    return uri ?? null;
  };

  const handleInstagram = useCallback(async () => {
    setBusy(true);
    try {
      const uri = await captureSelectedUri();
      if (!uri) throw new Error("capture_failed");
      await shareToInstagramStory(uri);
      try {
        trackEvent("share_completed", { content_type: "instagram_story", share_card: selected, completion_id: completionId });
      } catch {
        /* non-fatal */
      }
    } catch (e) {
      captureError(e, "ShareSheetModalInstagram");
      setInlineMsg({ text: "Try Save, then share from your photos.", type: "error" });
    } finally {
      setBusy(false);
    }
  }, [selected, completionId, cards]);

  const handleCopy = useCallback(async () => {
    if (Platform.OS === "web") {
      setInlineMsg({ text: "Copy image works in the mobile app.", type: "error" });
      return;
    }
    setBusy(true);
    try {
      const uri = await captureSelectedUri();
      if (!uri) throw new Error("capture_failed");
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
      await Clipboard.setImageAsync(base64);
      try {
        trackEvent("share_completed", { content_type: "clipboard_image", share_card: selected, completion_id: completionId });
      } catch {
        /* non-fatal */
      }
      setInlineMsg({ text: "Image copied. Paste in Instagram Stories or another app.", type: "success" });
    } catch (e) {
      captureError(e, "ShareSheetModalCopy");
      setInlineMsg({ text: "Try Save instead.", type: "error" });
    } finally {
      setBusy(false);
    }
  }, [selected, completionId, cards]);

  const handleSave = useCallback(async () => {
    if (Platform.OS === "web") {
      setInlineMsg({ text: "Save works in the mobile app.", type: "error" });
      return;
    }
    setBusy(true);
    try {
      const uri = await captureSelectedUri();
      if (!uri) throw new Error("capture_failed");
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        setInlineMsg({ text: "Allow photo library access to save.", type: "error" });
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      try {
        trackEvent("share_completed", { content_type: "save_photo", share_card: selected, completion_id: completionId });
      } catch {
        /* non-fatal */
      }
      setInlineMsg({ text: "Image saved to your library.", type: "success" });
    } catch (e) {
      captureError(e, "ShareSheetModalSave");
      setInlineMsg({ text: "Try again or use the system share sheet.", type: "error" });
    } finally {
      setBusy(false);
    }
  }, [selected, completionId, cards]);

  const handleShareSheet = useCallback(async () => {
    setBusy(true);
    try {
      const uri = await captureSelectedUri();
      if (!uri) throw new Error("capture_failed");
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your GRIIT card" });
        try {
          trackEvent("share_completed", { content_type: "system_share", share_card: selected, completion_id: completionId });
        } catch {
          /* non-fatal */
        }
      }
    } catch (e) {
      captureError(e, "ShareSheetModalSystemShare");
    } finally {
      setBusy(false);
    }
  }, [selected, completionId, cards]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Share</Text>
          <Pressable onPress={onClose} style={styles.closeHit} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>

        {inlineMsg ? (
          <View
            style={[
              styles.inlineMsg,
              inlineMsg.type === "error" ? styles.inlineMsgError : styles.inlineMsgSuccess,
            ]}
            accessibilityRole="alert"
          >
            <Text
              style={[
                styles.inlineMsgText,
                inlineMsg.type === "error" ? styles.inlineMsgTextError : styles.inlineMsgTextSuccess,
              ]}
            >
              {inlineMsg.text}
            </Text>
          </View>
        ) : null}

        <Text style={styles.hint}>{hints[selected]}</Text>

        <View
          style={[
            styles.previewOuter,
            {
              width: SHARE_CARD_DIMENSIONS.width * previewScale,
              height: SHARE_CARD_DIMENSIONS.height * previewScale,
            },
          ]}
        >
          {selected === "Transparent" ? <CheckerBackground /> : <View style={styles.previewSolidBg} />}
          <View style={styles.previewClip}>
            <View
              style={{
                width: SHARE_CARD_DIMENSIONS.width,
                height: SHARE_CARD_DIMENSIONS.height,
                transform: [{ scale: previewScale }],
              }}
            >
              {renderPreviewCard()}
            </View>
          </View>
        </View>

        <Text style={styles.thumbLabel}>Format</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
          {cards.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setSelected(c.key)}
              style={[styles.thumb, selected === c.key && styles.thumbOn]}
              accessibilityRole="button"
              accessibilityLabel={c.label}
            >
              <Text style={[styles.thumbText, selected === c.key && styles.thumbTextOn]}>{c.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {busy ? (
          <ActivityIndicator style={styles.busy} color={DS_COLORS.DISCOVER_CORAL} />
        ) : (
          <View style={styles.actions}>
            <Pressable style={styles.primaryBtn} onPress={() => void handleInstagram()} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>Instagram Story</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => void handleCopy()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Copy</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => void handleSave()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Save</Text>
            </Pressable>
            <Pressable style={styles.tertiaryBtn} onPress={() => void handleShareSheet()} accessibilityRole="button">
              <Text style={styles.tertiaryBtnText}>More…</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PAGE,
    paddingTop: DS_SPACING.md,
    paddingBottom: DS_SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  closeHit: { paddingVertical: 8, paddingHorizontal: 4 },
  closeText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.DISCOVER_CORAL,
  },
  inlineMsg: {
    marginHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.sm,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    borderRadius: DS_RADIUS.MD,
  },
  inlineMsgSuccess: {
    backgroundColor: DS_COLORS.GREEN_BG,
  },
  inlineMsgError: {
    backgroundColor: DS_COLORS.BADGE_HARD_BG,
  },
  inlineMsgText: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    textAlign: "center",
  },
  inlineMsgTextSuccess: { color: DS_COLORS.GREEN },
  inlineMsgTextError: { color: DS_COLORS.BADGE_HARD_RED },
  hint: {
    fontSize: 13,
    color: DS_COLORS.TEXT_MUTED,
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.md,
    lineHeight: 18,
  },
  previewOuter: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DS_SPACING.lg,
    borderRadius: DS_RADIUS.card,
    overflow: "hidden",
    position: "relative",
  },
  previewSolidBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.BG_DARK,
  },
  checkerWrap: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  checkerCell: {
    position: "absolute",
    width: CHECKER,
    height: CHECKER,
  },
  previewClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderRadius: DS_RADIUS.card,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbLabel: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_SECONDARY,
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: 8,
  },
  thumbRow: {
    paddingHorizontal: DS_SPACING.lg,
    gap: 8,
    paddingBottom: DS_SPACING.md,
  },
  thumb: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  thumbOn: {
    borderColor: DS_COLORS.DISCOVER_CORAL,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  thumbText: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  thumbTextOn: {
    color: DS_COLORS.DISCOVER_CORAL,
  },
  busy: { marginVertical: 16 },
  actions: {
    paddingHorizontal: DS_SPACING.lg,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: DS_RADIUS.joinCta,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: DS_COLORS.WHITE,
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  secondaryBtn: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.joinCta,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  secondaryBtnText: {
    color: DS_COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  tertiaryBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  tertiaryBtnText: {
    fontSize: 14,
    color: DS_COLORS.TEXT_MUTED,
    fontWeight: "500",
  },
});
