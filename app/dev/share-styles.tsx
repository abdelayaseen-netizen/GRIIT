/**
 * Dev-only. Route: /dev/share-styles
 * Renders all 7 styles × 3 colours through view-shot and saves each PNG to Photos.
 */
import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import Screen from "@/components/ds/Screen";
import { DS_V3 } from "@/lib/design-system";
import ShareImage from "@/components/share/ShareImage";
import { saveStickerToPhotos } from "@/lib/share";
import { savePhotosCopy } from "@/lib/share-sticker";
import { SHARE_H, SHARE_PREVIEW_H, SHARE_PREVIEW_W, SHARE_W, type ShareCardInput } from "@/lib/share-image";
import { shareReviewCard, shareReviewCards } from "@/lib/share-review-cards";

const CARDS = shareReviewCards();

export default function ShareStylesDevScreen() {
  const shotRef = useRef<ViewShot>(null);
  const [current, setCurrent] = useState<ShareCardInput>(CARDS[0] ?? shareReviewCard("A", "ink"));
  const [status, setStatus] = useState("Save all 21 to Photos");
  const [busy, setBusy] = useState(false);

  if (!__DEV__) return null;

  const paint = async (card: ShareCardInput) => {
    setCurrent(card);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    return shotRef.current?.capture?.() ?? null;
  };

  const saveAll = async () => {
    if (busy) return;
    setBusy(true);
    let saved = 0;
    try {
      for (const card of CARDS) {
        const uri = await paint(card);
        if (!uri) continue;
        const result = await saveStickerToPhotos(uri);
        if (result === "saved") saved += 1;
        else {
          setStatus(savePhotosCopy(result));
          return;
        }
      }
      setStatus(`Saved ${saved} to Photos.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Share styles</Text>
        <Text style={styles.kicker}>7 styles × 3 colours · view-shot 1080 × 1920</Text>
        <Pressable accessibilityRole="button" onPress={() => void saveAll()} style={styles.save}>
          <Text style={styles.saveLabel}>{busy ? "Saving…" : status}</Text>
        </Pressable>
        {CARDS.map((card) => (
          <Pressable
            key={`${card.style}-${card.colour}`}
            accessibilityRole="button"
            accessibilityLabel={`${card.style} ${card.colour}`}
            onPress={() => void paint(card).then(async (uri) => {
              if (!uri) return;
              const result = await saveStickerToPhotos(uri);
              setStatus(`${card.style} ${card.colour}: ${savePhotosCopy(result)}`);
            })}
            style={styles.card}
          >
            <Text style={styles.cardLabel}>{`${card.style} · ${card.colour}`}</Text>
            <View style={styles.preview}>
              <View style={styles.scale}>
                <ShareImage input={card} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.shotHost} collapsable={false}>
        <ViewShot ref={shotRef} options={{ format: "png", quality: 1, result: "tmpfile" }} style={styles.shot}>
          <ShareImage input={current} />
        </ViewShot>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  scroll: { padding: 20, gap: 16 },
  title: { color: DS_V3.color.textPrimary, fontSize: 28, lineHeight: 34, fontWeight: "500" },
  kicker: { color: DS_V3.color.textSecondary, fontSize: 13, lineHeight: 18 },
  save: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: DS_V3.color.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  saveLabel: { color: DS_V3.color.textPrimary, fontSize: 15, fontWeight: "500" },
  card: { gap: 8 },
  cardLabel: { color: DS_V3.color.textSecondary, fontSize: 12, letterSpacing: 0.7 },
  preview: {
    width: SHARE_PREVIEW_W,
    height: SHARE_PREVIEW_H,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
  },
  scale: {
    position: "absolute",
    width: SHARE_W,
    height: SHARE_H,
    left: (SHARE_PREVIEW_W - SHARE_W) / 2,
    top: (SHARE_PREVIEW_H - SHARE_H) / 2,
    transform: [{ scale: SHARE_PREVIEW_W / SHARE_W }],
  },
  shotHost: { position: "absolute", left: -SHARE_W - 40, top: 0 },
  shot: { width: SHARE_W, height: SHARE_H },
});
