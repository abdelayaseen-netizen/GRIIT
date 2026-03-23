import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import type { RefObject } from "react";
import type ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { GRIIT_COLORS } from "@/lib/design-system";
import { shareToInstagramStory } from "@/lib/share";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

type CardOption = {
  label: string;
  ref: RefObject<ViewShot | null>;
  available: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  shareRef: RefObject<ViewShot | null>;
  proofCardRef: RefObject<ViewShot | null>;
  transparentCardRef: RefObject<ViewShot | null>;
  grindCardRef: RefObject<ViewShot | null>;
  hasPhoto: boolean;
  completionId?: string | null;
};

async function captureCard(ref: RefObject<ViewShot | null>): Promise<string | null> {
  try {
    const current = ref.current as { capture?: () => Promise<string> } | null;
    if (!current?.capture) return null;
    const uri = await current.capture();
    if (!uri) return null;
    const base = FileSystem.cacheDirectory;
    if (!base) return null;
    const filename = `${base}griit-share-${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: filename });
    return filename;
  } catch {
    return null;
  }
}

export default function ShareSheetModal({
  visible,
  onClose,
  shareRef,
  proofCardRef,
  transparentCardRef,
  grindCardRef,
  hasPhoto,
  completionId,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sharing, setSharing] = useState(false);

  const cards: CardOption[] = [
    { label: "Statement", ref: shareRef, available: true },
    { label: "Transparent", ref: transparentCardRef, available: true },
    { label: "Proof", ref: proofCardRef, available: hasPhoto },
    { label: "Breakdown", ref: grindCardRef, available: true },
  ].filter((c) => c.available);

  const selectedCard = cards[selectedIdx] ?? cards[0];

  useEffect(() => {
    if (visible) setSelectedIdx(0);
  }, [visible]);

  useEffect(() => {
    if (selectedIdx >= cards.length) setSelectedIdx(0);
  }, [cards.length, selectedIdx]);

  const handleShare = useCallback(
    async (mode: "system" | "instagram" | "save") => {
      if (!selectedCard) return;
      setSharing(true);
      try {
        const uri = await captureCard(selectedCard.ref);
        if (!uri) return;

        if (mode === "instagram") {
          await shareToInstagramStory(uri);
        } else if (mode === "save") {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            await MediaLibrary.saveToLibraryAsync(uri);
            if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          const available = await Sharing.isAvailableAsync();
          if (available) {
            await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your GRIIT proof" });
          }
        }
        if (completionId && mode !== "save") {
          trpcMutate(TRPC.checkins.markAsShared, { completionId }).catch(() => {});
        }
      } finally {
        setSharing(false);
      }
    },
    [selectedCard, completionId]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={ms.container}>
        <View style={ms.header}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
            <X size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <Text style={ms.headerTitle}>Share completion</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ms.cardScroll}>
          {cards.map((card, idx) => (
            <TouchableOpacity
              key={card.label}
              style={[ms.cardChip, selectedIdx === idx && ms.cardChipActive]}
              onPress={() => setSelectedIdx(idx)}
              accessibilityLabel={`Select ${card.label} card`}
            >
              <Text style={[ms.cardChipText, selectedIdx === idx && ms.cardChipTextActive]}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={ms.preview}>
          <Text style={ms.previewHint}>
            {selectedCard?.label === "Transparent"
              ? "Saves as transparent PNG — overlay on your own photo in IG Stories"
              : `${selectedCard?.label} card — ready to share`}
          </Text>
        </View>

        <Text style={ms.shareToLabel}>Share to</Text>
        <View style={ms.destRow}>
          <TouchableOpacity style={ms.destBtn} onPress={() => void handleShare("instagram")} disabled={sharing}>
            <View style={[ms.destIcon, { backgroundColor: "#E4405F" }]}>
              <Text style={ms.destEmoji}>📷</Text>
            </View>
            <Text style={ms.destLabel}>IG Story</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.destBtn} onPress={() => void handleShare("save")} disabled={sharing}>
            <View style={[ms.destIcon, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={ms.destEmoji}>💾</Text>
            </View>
            <Text style={ms.destLabel}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.destBtn} onPress={() => void handleShare("system")} disabled={sharing}>
            <View style={[ms.destIcon, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={ms.destEmoji}>↗</Text>
            </View>
            <Text style={ms.destLabel}>More</Text>
          </TouchableOpacity>
        </View>

        {sharing ? <ActivityIndicator size="small" color={GRIIT_COLORS.primary} style={{ marginTop: 16 }} /> : null}
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  cardScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  cardChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
  },
  cardChipActive: { backgroundColor: GRIIT_COLORS.primary },
  cardChipText: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.4)" },
  cardChipTextActive: { color: "#fff" },
  preview: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewHint: { fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", paddingHorizontal: 32 },
  shareToLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  destRow: { flexDirection: "row", gap: 16, paddingHorizontal: 20, paddingBottom: 32 },
  destBtn: { alignItems: "center", gap: 6 },
  destIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  destEmoji: { fontSize: 20 },
  destLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
});
