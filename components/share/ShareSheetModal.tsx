import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { X } from "lucide-react-native";
import { GRIIT_COLORS, DS_COLORS } from "@/lib/design-system";
import { shareToInstagramStory } from "@/lib/share";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  StatementCard,
  TransparentCard,
  ProofReceiptCard,
  BreakdownCard,
  CalloutCard,
  CARD_WIDTH,
  CARD_HEIGHT,
  PREVIEW_SCALE,
  SELECTED_PREVIEW_SCALE,
} from "@/components/share/ShareCards";

type ShareCardId = "statement" | "transparent" | "proof" | "breakdown" | "callout";

type Props = {
  visible: boolean;
  onClose: () => void;
  dayNumber: number;
  totalDays: number;
  challengeName: string;
  taskName: string;
  proofPhotoUri?: string | null;
  rank: string;
  tasksToday: Array<{ name: string; details: string; timestamp: string; verified?: boolean }>;
  isAllDayComplete: boolean;
  isChallengeComplete: boolean;
  hasPhoto: boolean;
  completionId?: string | null;
};

async function captureCard(ref: React.RefObject<ViewShot | null>): Promise<string | null> {
  try {
    const current = ref.current as { capture?: () => Promise<string> } | null;
    if (!current?.capture) return null;
    return await current.capture();
  } catch (e) {
    if (__DEV__) console.error("[ShareSheetModal] captureCard failed:", e);
    return null;
  }
}

export default function ShareSheetModal({
  visible,
  onClose,
  dayNumber,
  totalDays,
  challengeName,
  taskName,
  proofPhotoUri,
  rank,
  tasksToday,
  isAllDayComplete,
  isChallengeComplete,
  hasPhoto,
  completionId,
}: Props) {
  const [selectedCard, setSelectedCard] = useState<ShareCardId>("statement");
  const [sharing, setSharing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShot | null>(null);
  const availableCards = useMemo(() => {
    const cards: { id: ShareCardId; label: string }[] = [
      { id: "statement", label: "Statement" },
      { id: "transparent", label: "Transparent" },
    ];
    if (hasPhoto) cards.push({ id: "proof", label: "Proof" });
    if (isAllDayComplete) cards.push({ id: "breakdown", label: "Breakdown" });
    if (isChallengeComplete) cards.push({ id: "callout", label: "Callout" });
    return cards;
  }, [hasPhoto, isAllDayComplete, isChallengeComplete]);
  const selectedExists = availableCards.some((c) => c.id === selectedCard);

  useEffect(() => {
    if (visible) setSelectedCard("statement");
  }, [visible]);

  useEffect(() => {
    const firstCard = availableCards[0];
    if (!selectedExists && firstCard) setSelectedCard(firstCard.id);
  }, [selectedExists, availableCards]);

  const renderCard = useCallback(
    (id: ShareCardId) => {
      if (id === "statement") {
        return <StatementCard dayNumber={dayNumber} challengeName={challengeName} calloutText="Most split by Day 3." />;
      }
      if (id === "transparent") {
        return (
          <TransparentCard
            dayNumber={dayNumber}
            challengeName={challengeName}
            taskName={taskName}
            proofPhotoUri={proofPhotoUri}
            tasksCompleted={tasksToday.length}
            totalTasks={Math.max(1, tasksToday.length)}
            rank={rank}
          />
        );
      }
      if (id === "proof") {
        return (
          <ProofReceiptCard
            dayNumber={dayNumber}
            totalDays={Math.max(totalDays, dayNumber)}
            challengeName={challengeName}
            tasks={tasksToday}
            rank={rank}
          />
        );
      }
      if (id === "breakdown") {
        return <BreakdownCard dayNumber={dayNumber} challengeName={challengeName} tasks={tasksToday} rank={rank} />;
      }
      return <CalloutCard challengeName={challengeName} totalDays={Math.max(totalDays, dayNumber)} totalTasks={Math.max(tasksToday.length, 1) * Math.max(totalDays, dayNumber)} />;
    },
    [dayNumber, challengeName, taskName, proofPhotoUri, tasksToday, rank, totalDays]
  );

  const handleShare = useCallback(
    async (mode: "system" | "instagram" | "save") => {
      setSharing(true);
      try {
        const uri = await captureCard(viewShotRef);
        if (!uri) return;

        if (mode === "instagram") {
          await shareToInstagramStory(uri);
        } else if (mode === "save") {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            await MediaLibrary.saveToLibraryAsync(uri);
            setSaveMessage("Image saved to your camera roll.");
            setTimeout(() => setSaveMessage(null), 3000);
          }
        } else {
          const available = await Sharing.isAvailableAsync();
          if (available) {
            await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your GRIIT proof" });
          }
        }
        if (completionId && mode !== "save") {
          trpcMutate(TRPC.checkins.markAsShared, { completionId }).catch((e) => {
            if (__DEV__) console.error("[ShareSheetModal] markAsShared failed:", e);
          });
        }
      } finally {
        setSharing(false);
      }
    },
    [completionId]
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ms.thumbScroll}>
          {availableCards.map((card) => (
            <TouchableOpacity key={card.id} style={ms.thumbWrap} onPress={() => setSelectedCard(card.id)} accessibilityLabel={`Select ${card.label} card`}>
              <View style={[ms.thumbCard, selectedCard === card.id && ms.thumbCardActive]}>
                <View style={{ transform: [{ scale: PREVIEW_SCALE }] }}>{renderCard(card.id)}</View>
              </View>
              <Text style={ms.thumbLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={ms.preview}>
          <View style={{ transform: [{ scale: SELECTED_PREVIEW_SCALE }] }}>{renderCard(selectedCard)}</View>
        </View>
        <View style={{ position: "absolute", left: -9999, opacity: 0 }}>
          <ViewShot ref={viewShotRef} options={{ format: "png", width: CARD_WIDTH, height: CARD_HEIGHT }}>
            {renderCard(selectedCard)}
          </ViewShot>
        </View>

        <Text style={ms.shareToLabel}>Share to</Text>
        <View style={ms.destRow}>
          <TouchableOpacity style={ms.destBtn} onPress={() => void handleShare("instagram")} disabled={sharing}>
            <View style={[ms.destIcon, { backgroundColor: DS_COLORS.DISCOVER_CORAL }]}>
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
        {saveMessage ? (
          <Text
            style={ms.saveHint}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {saveMessage}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.SHARE_CARD_BG, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  thumbScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 12 },
  thumbWrap: { alignItems: "center", marginRight: 10 },
  thumbCard: {
    width: CARD_WIDTH * PREVIEW_SCALE + 10,
    height: CARD_HEIGHT * PREVIEW_SCALE + 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: DS_COLORS.BLACK,
    opacity: 0.6,
  },
  thumbCardActive: { borderColor: GRIIT_COLORS.primary, borderWidth: 2, opacity: 1 },
  thumbLabel: { marginTop: 6, color: DS_COLORS.WHITE, fontSize: 11 },
  preview: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  saveHint: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 12, paddingHorizontal: 20 },
});
