/**
 * v44.1 share sheet. Swipe styles, pick a colour, caption as text only.
 * The preview is ShareImage scaled. The file handed to every target is a
 * view-shot of that same component at 1080 × 1920.
 * Build 90 04.6: four distinct cards per moment, no stock photo behind any of them.
 * Build 92 05: the task and day moments are the Part 1.3 carousel — Photo · Week strip ·
 * Streak glow · Progress ring in Ink / Orange / White; the transparent two are GRIIT Pro.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  PixelRatio,
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
import { Image } from "expo-image";
import { Copy, Download, Ellipsis, Instagram, Lock, MessageCircle, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import ShareImage, { ShareStickerBlock } from "@/components/share/ShareImage";
import ProUpgradeSheet from "@/components/share/ProUpgradeSheet";
import { useProStatus } from "@/hooks/useProStatus";
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
  STICKER_FREE,
  STICKER_PRO,
  STICKER_UNLOCK,
  colourForStyle,
  copyStickerAvailable,
  shareJoinLine,
  shareMessageBody,
  stickerStyleLabel,
  stickerStyleMeta,
  storyShotSize,
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

/** Build 92 05.2: a transparent sticker previews over the user's own photo, else a checker. Never a stock photo. */
function TransparentBackdrop({ photoUri }: { photoUri?: string | null }) {
  if (photoUri) return <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />;
  return (
    <View style={styles.checker} pointerEvents="none">
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8);
        const dark = (row + i) % 2 === 0;
        return <View key={i} style={[styles.check, dark ? styles.checkDark : styles.checkLight]} />;
      })}
    </View>
  );
}

function ScaledPreview({
  card,
  frameW,
  frameH,
  locked,
  onPress,
}: {
  card: ShareCardInput;
  frameW: number;
  frameH: number;
  locked: boolean;
  onPress?: () => void;
}) {
  const scale = Math.min(frameW / SHARE_W, frameH / SHARE_H);
  const scaledW = SHARE_W * scale;
  const scaledH = SHARE_H * scale;
  const transparent = stickerStyleMeta(card.style).transparent;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? STICKER_UNLOCK : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID="sticker-card"
      style={[styles.previewClip, { width: frameW, height: frameH, alignItems: "center", justifyContent: "center" }]}
    >
      {transparent ? <TransparentBackdrop photoUri={card.photoUri} /> : null}
      <View style={{ width: scaledW, height: scaledH, overflow: "hidden" }}>
        <View
          style={{
            width: SHARE_W,
            height: SHARE_H,
            transform: [
              { translateX: -((SHARE_W - scaledW) / 2) },
              { translateY: -((SHARE_H - scaledH) / 2) },
              { scale },
            ],
          }}
        >
          <ShareImage input={card} />
        </View>
      </View>
      {locked ? (
        <View style={styles.proChip} testID="sticker-pro-chip" accessible accessibilityLabel={STICKER_PRO}>
          <Lock size={12} color={DS_V3.color.textPrimary} />
          <Text style={styles.proChipText}>{STICKER_PRO}</Text>
        </View>
      ) : null}
    </Pressable>
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
  const { width, height } = useWindowDimensions();
  const previewH = Math.min(SHARE_PREVIEW_H, Math.max(280, height - insets.top - insets.bottom - 360));
  const previewW = Math.round(previewH * (SHARE_W / SHARE_H));
  const stylesFor = useMemo(
    () => stylesForMoment(moment, { streak: card.streak, hasPhoto: Boolean(card.photoUri) }),
    [moment, card.streak, card.photoUri],
  );
  const shotRef = useRef<ViewShot>(null);
  const stickerShotRef = useRef<ViewShot>(null);
  const { isPro } = useProStatus();
  const [proOpen, setProOpen] = useState(false);
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
  const meta = stickerStyleMeta(styleId);
  const locked = meta.pro && !isPro;
  const hasPhoto = Boolean(card.photoUri);

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setCaption("");
    setSaveStatus(null);
    setProOpen(false);
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
  /** Build 92 05.5: transparent styles hand Copy sticker and the Instagram sticker the block alone. */
  const captureSticker = useCallback(async () => {
    if (!meta.transparent) return null;
    const uri = await stickerShotRef.current?.capture?.();
    return uri ?? null;
  }, [meta.transparent]);

  const run = useCallback(
    async (kind: "story" | "save" | "messages" | "more" | "copy") => {
      if (busy || locked) return;
      setBusy(true);
      setSaveStatus(null);
      try {
        const uri = await capture();
        if (!uri) return;
        const stickerUri = (await captureSticker()) ?? uri;
        const body = shareMessageBody(
          caption,
          shareJoinLine({ username: card.username, inviteId: card.inviteCode }),
        );
        if (kind === "copy") {
          if (!copyStickerAvailable(styleId)) return;
          await copyStickerPngToPasteboard(stickerUri);
          setSaveStatus(STICKER.copied);
          setTimeout(() => setSaveStatus(null), 2200);
          return;
        }
        if (kind === "story") {
          const opened = await shareToInstagramStory(storyUsesSticker(styleId) ? stickerUri : uri, {
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
    [busy, caption, capture, captureSticker, card.inviteCode, card.username, locked, palette.bg, styleId],
  );

  const targets = [
    ...(copyStickerAvailable(styleId)
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
              <ScaledPreview
                frameW={previewW}
                frameH={previewH}
                card={{ ...card, style: id, colour: colourForStyle(memory, id) }}
                locked={stickerStyleMeta(id).pro && !isPro}
                onPress={stickerStyleMeta(id).pro && !isPro ? () => setProOpen(true) : undefined}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {stylesFor.map((id, i) => (
            <View key={id} style={[styles.dot, i === index ? styles.dotOn : null]} />
          ))}
        </View>

        {meta.label ? (
          <View style={styles.nameRow}>
            <Text style={styles.styleName} testID="sticker-style-name">
              {stickerStyleLabel(styleId, hasPhoto)}
            </Text>
            {meta.pro ? (
              <View style={styles.proTag}>
                <Lock size={11} color={DS_V3.color.textPrimary} />
                <Text style={styles.proTagText}>{STICKER_PRO}</Text>
              </View>
            ) : (
              <Text style={styles.freeTag}>{STICKER_FREE}</Text>
            )}
          </View>
        ) : null}

        {children}

        <View style={styles.themes} testID="sticker-theme">
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
                style={[styles.themePill, on ? styles.themePillOn : null]}
              >
                <View style={[styles.themeDot, { backgroundColor: swatch.bg, borderColor: swatch.id === "ink" ? DS_V3.color.textTertiary : swatch.bg }]} />
                <Text style={[styles.themeLabel, on ? styles.themeLabelOn : null]}>{swatch.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {locked ? null : (
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={SHARE_CAPTION_PLACEHOLDER}
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.caption}
            accessibilityLabel={SHARE_CAPTION_PLACEHOLDER}
          />
        )}

        {locked ? (
          <View style={[styles.unlockWrap, { paddingBottom: insets.bottom + 34 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={STICKER_UNLOCK}
              onPress={() => setProOpen(true)}
              style={styles.unlock}
              testID="sticker-unlock"
            >
              <Text style={styles.unlockText}>{STICKER_UNLOCK}</Text>
            </Pressable>
          </View>
        ) : (
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
        )}

        {saveStatus ? (
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <Text style={styles.saved}>{saveStatus}</Text>
          </View>
        ) : null}

        <View pointerEvents="none" style={styles.shotHost} collapsable={false}>
          <ViewShot
            ref={shotRef}
            // Build 92 05.5: the story file is 1080×1920 pixels. view-shot sizes in points at the
            // device scale, so the target is SHARE_W / PixelRatio by SHARE_H / PixelRatio points.
            options={{ format: "png", quality: 1, result: "tmpfile", ...storyShotSize(PixelRatio.get()) }}
            style={{ width: SHARE_W, height: SHARE_H, backgroundColor: "transparent" }}
          >
            <ShareImage input={input} />
          </ViewShot>
          {meta.transparent ? (
            <ViewShot
              ref={stickerShotRef}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={{ backgroundColor: "transparent" }}
            >
              <ShareStickerBlock input={input} />
            </ViewShot>
          ) : null}
        </View>
        <ProUpgradeSheet visible={proOpen} onClose={() => setProOpen(false)} onUnlocked={() => setProOpen(false)} />
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
    minHeight: 24,
  },
  styleName: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  freeTag: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  proTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.raised,
  },
  proTagText: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  proChip: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: "rgba(15,15,15,0.72)",
  },
  proChipText: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  themes: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 3,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
  },
  themePill: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  themePillOn: { backgroundColor: DS_V3.color.raised },
  themeDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  themeLabel: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  themeLabelOn: { color: DS_V3.color.textPrimary, fontWeight: "600" },
  unlockWrap: { marginTop: "auto", paddingHorizontal: 20, paddingTop: 12 },
  unlock: {
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockText: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
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
