/**
 * v44.1 share sheet. Swipe styles, pick a colour, caption as text only.
 * The preview is ShareImage scaled. The file handed to every target is a
 * view-shot of that same component at 1080 × 1920.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "expo-image";

const SAMPLE_STORY = require("../../design/handoff/v51/handoff/GRIIT-v51-handoff/atlas/assets/proofs/sunrise1.jpg");
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Copy, Download, Ellipsis, Instagram, MessageCircle, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import ShareImage from "@/components/share/ShareImage";
import {
  copyStickerPngToPasteboard,
  saveStickerToPhotos,
  shareImageAndCaption,
  shareStickerToMessages,
  shareToInstagramStory,
} from "@/lib/share";
import { facebookAppId, savePhotosCopy, showStoryAction } from "@/lib/share-sticker";
import { OPENED_IN_INSTAGRAM, STICKER } from "@/lib/copy";
import { readShareColours, writeShareColour } from "@/lib/share-colour";
import {
  SHARE_CAPTION_PLACEHOLDER,
  SHARE_COLOURS,
  SHARE_H,
  SHARE_INVITE_TITLE,
  SHARE_PALETTES,
  SHARE_PREVIEW_H,
  SHARE_PREVIEW_W,
  SHARE_SHEET_TITLE,
  SHARE_TARGET_COPY,
  SHARE_TARGET_MESSAGES,
  SHARE_TARGET_MORE,
  SHARE_TARGET_SAVE,
  SHARE_TARGET_STORY,
  SHARE_W,
  colourForStyle,
  shareJoinLine,
  shareMessageBody,
  storyUsesSticker,
  stylesForMoment,
  type ColourMemory,
  type ShareCardInput,
  type ShareMoment,
  type ShareStyleId,
} from "@/lib/share-image";

export type ShareSystemSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  moment: ShareMoment;
  card: Omit<ShareCardInput, "style" | "colour">;
  title?: string;
  children?: React.ReactNode;
};

function ScaledPreview({ card }: { card: ShareCardInput }) {
  return (
    <View style={styles.previewClip}>
      {card.style === "B" ? <Image source={SAMPLE_STORY} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      <View style={styles.previewScale}>
        <ShareImage input={card} />
      </View>
    </View>
  );
}

export default function ShareSystemSheet({
  visible,
  onDismiss,
  moment,
  card,
  title,
  children,
}: ShareSystemSheetProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const stylesFor = stylesForMoment(moment);
  const shotRef = useRef<ViewShot>(null);
  const [index, setIndex] = useState(0);
  const [memory, setMemory] = useState<ColourMemory>({});
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const styleId: ShareStyleId = stylesFor[index] ?? stylesFor[0] ?? "A";
  const colour = colourForStyle(memory, styleId);
  const showStory = showStoryAction(facebookAppId());
  const heading = title ?? (moment === "invite" ? SHARE_INVITE_TITLE : SHARE_SHEET_TITLE);
  const input = useMemo<ShareCardInput>(
    () => ({ ...card, style: styleId, colour }),
    [card, colour, styleId],
  );
  const palette = SHARE_PALETTES[colour];

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setCaption("");
    setSaveStatus(null);
    let cancelled = false;
    void readShareColours().then((loaded) => {
      if (!cancelled) setMemory(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, moment]);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
      const next = Math.max(0, Math.min(stylesFor.length - 1, page));
      setIndex(next);
    },
    [stylesFor.length, width],
  );

  const capture = useCallback(async () => {
    const uri = await shotRef.current?.capture?.();
    return uri ?? null;
  }, []);

  const run = useCallback(
    async (kind: "story" | "save" | "messages" | "more" | "copy") => {
      if (busy) return;
      setBusy(true);
      setSaveStatus(null);
      try {
        const uri = await capture();
        if (!uri) return;
        const body = shareMessageBody(
          caption,
          shareJoinLine({ username: card.username, inviteId: card.inviteCode }),
        );
        if (kind === "copy") {
          if (!storyUsesSticker(styleId)) return;
          await copyStickerPngToPasteboard(uri);
          setSaveStatus(STICKER.copied);
          setTimeout(() => setSaveStatus(null), 2200);
          return;
        }
        if (kind === "story") {
          const opened = await shareToInstagramStory(uri, {
            asSticker: storyUsesSticker(styleId),
            backgroundTopColor: palette.bg,
            backgroundBottomColor: palette.bg,
            caption: caption.trim(),
          });
          if (opened === "instagram") setSaveStatus(OPENED_IN_INSTAGRAM);
          return;
        }
        if (kind === "save") {
          const result = await saveStickerToPhotos(uri);
          setSaveStatus(savePhotosCopy(result));
          return;
        }
        if (kind === "messages") {
          await shareStickerToMessages(uri, body);
          return;
        }
        await shareImageAndCaption(uri, body);
      } finally {
        setBusy(false);
      }
    },
    [busy, caption, capture, card.inviteCode, palette.bg, styleId],
  );

  const targets = [
    ...(storyUsesSticker(styleId)
      ? [{ id: "copy" as const, label: SHARE_TARGET_COPY, icon: Copy, primary: false }]
      : []),
    ...(showStory ? [{ id: "story" as const, label: SHARE_TARGET_STORY, icon: Instagram, primary: false }] : []),
    { id: "save" as const, label: SHARE_TARGET_SAVE, icon: Download, primary: false },
    { id: "messages" as const, label: SHARE_TARGET_MESSAGES, icon: MessageCircle, primary: false },
    { id: "more" as const, label: SHARE_TARGET_MORE, icon: Ellipsis, primary: false },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onDismiss}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onDismiss} style={styles.close}>
            <X size={22} color={DS_V3.color.textPrimary} />
          </Pressable>
          <Text style={styles.title}>{heading}</Text>
          <View style={styles.close} />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.pager}
        >
          {stylesFor.map((id) => (
            <View key={id} style={[styles.page, { width }]}>
              <ScaledPreview card={{ ...card, style: id, colour: colourForStyle(memory, id) }} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {stylesFor.map((id, i) => (
            <View key={id} style={[styles.dot, i === index ? styles.dotOn : null]} />
          ))}
        </View>

        {children}

        <View style={styles.colours}>
          {SHARE_COLOURS.map((id) => {
            const swatch = SHARE_PALETTES[id];
            const on = id === colour;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={swatch.label}
                onPress={() => {
                  void writeShareColour(memory, styleId, id).then(setMemory);
                }}
                style={styles.colourHit}
              >
                <View style={[styles.swatchWrap, on ? styles.swatchOn : null]}>
                  <View style={[styles.swatch, { backgroundColor: swatch.bg, borderColor: swatch.id === "ink" ? DS_V3.color.border : swatch.bg }]} />
                </View>
                <Text style={styles.colourLabel}>{swatch.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder={SHARE_CAPTION_PLACEHOLDER}
          placeholderTextColor={DS_V3.color.textSecondary}
          style={styles.caption}
          accessibilityLabel={SHARE_CAPTION_PLACEHOLDER}
        />

        <View style={[styles.targets, { paddingBottom: insets.bottom + 34 }]}>
          {targets.map((target) => {
            const Icon = target.icon;
            return (
              <Pressable
                key={target.id}
                accessibilityRole="button"
                accessibilityLabel={target.label}
                disabled={busy}
                onPress={() => void run(target.id)}
                style={styles.target}
              >
                <View style={[styles.circle, target.primary ? styles.circleOn : null]}>
                  <Icon size={22} color={target.primary ? DS_V3.color.onBrand : DS_V3.color.textPrimary} />
                </View>
                <Text style={styles.targetLabel}>{target.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {saveStatus ? (
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <Text style={styles.saved}>{saveStatus}</Text>
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.shotHost} collapsable={false}>
          <ViewShot
            ref={shotRef}
            options={{ format: "png", quality: 1, result: "tmpfile" }}
            style={{ width: SHARE_W, height: SHARE_H, backgroundColor: input.style === "B" ? "transparent" : "transparent" }}
          >
            <ShareImage input={input} />
          </ViewShot>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: {
    flex: 1,
    textAlign: "center",
    color: DS_V3.color.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
  },
  pager: { flexGrow: 0 },
  page: { alignItems: "center", paddingTop: 8 },
  previewClip: {
    width: SHARE_PREVIEW_W,
    height: SHARE_PREVIEW_H,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  checker: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  check: { width: "12.5%", height: "12.5%" },
  checkLight: { backgroundColor: "#E7E2D8" },
  checkDark: { backgroundColor: "#8E887E" },
  previewScale: {
    position: "absolute",
    width: SHARE_W,
    height: SHARE_H,
    left: (SHARE_PREVIEW_W - SHARE_W) / 2,
    top: (SHARE_PREVIEW_H - SHARE_H) / 2,
    transform: [{ scale: SHARE_PREVIEW_W / SHARE_W }],
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    height: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_V3.color.textSecondary,
  },
  dotOn: { width: 18, backgroundColor: DS_V3.color.textPrimary },
  colours: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    paddingVertical: 8,
  },
  colourHit: { alignItems: "center", gap: 6, minWidth: 64 },
  swatchWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchOn: {
    borderWidth: 2,
    borderColor: DS_V3.color.textPrimary,
    shadowColor: DS_V3.color.textPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  colourLabel: {
    color: DS_V3.color.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
  },
  caption: {
    marginHorizontal: 20,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: DS_V3.color.surface,
    color: DS_V3.color.textPrimary,
    fontSize: 15,
  },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 120,
    borderRadius: 12,
    backgroundColor: DS_V3.color.raised,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saved: {
    textAlign: "center",
    color: DS_V3.color.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  targets: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 12,
  },
  target: { alignItems: "center", gap: 6, width: 76 },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
  },
  circleOn: {
    backgroundColor: DS_V3.color.primary,
    borderColor: DS_V3.color.primary,
  },
  targetLabel: {
    color: DS_V3.color.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
  },
  shotHost: {
    position: "absolute",
    left: -SHARE_W - 40,
    top: 0,
  },
});
