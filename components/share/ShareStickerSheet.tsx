/**
 * Frame 99 share sheet. Clear / Card / Photo. Story, Copy, Save, More.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import SegmentedControl from "@/components/ds/SegmentedControl";
import Sheet from "@/components/ds/Sheet";
import FinishTextCard from "@/components/share/FinishTextCard";
import { BadgeSticker, ConsistencySticker, DaySticker } from "@/components/share/ShareSticker";
import { sharePlainMessage, shareProgressImage, shareToInstagramStory } from "@/lib/share";
import {
  SHARE_BG_CLEAR,
  SHARE_BG_ITEMS,
  SHARE_BG_PHOTO,
  SHARE_CLEAR_CAPTION,
  SHARE_COPY,
  SHARE_EMPTY,
  SHARE_EMPTY_HINT,
  SHARE_MORE,
  SHARE_PHOTO_PRIVATE,
  SHARE_SAVE,
  SHARE_SHEET,
  SHARE_STORY,
  STICKER_W,
  backgroundFromSegment,
  dayStickerCaption,
  defaultStickerBackground,
  photoBackgroundAllowed,
  segmentFromBackground,
  type ProofKind,
  type StickerBackground,
  type StickerVariant,
} from "@/lib/share-sticker";

export type ShareStickerDay = {
  challenge: string;
  day: number;
  durationDays: number;
  proof: ProofKind;
  photoUri?: string | null;
  photoShared?: boolean;
};

export type ShareStickerText = {
  challengeTitle: string;
  title: string;
  dayN: number;
  durationDays: number;
  gateLine: string;
};

export type ShareStickerConsistency = {
  secured: number;
  closed: number;
  cameraSecured: number;
  last28: boolean[];
  photoUri?: string | null;
  photoShared?: boolean;
};

export type ShareStickerBadge = {
  count: number;
  secured: number;
  byCamera: number;
  earnedOn: string;
  photoUri?: string | null;
  photoShared?: boolean;
};

export type ShareStickerSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  variant: StickerVariant;
  day?: ShareStickerDay;
  text?: ShareStickerText;
  consistency?: ShareStickerConsistency;
  badge?: ShareStickerBadge;
  children?: React.ReactNode;
};

function Checkerboard({ children }: { children: React.ReactNode }) {
  const cells = Array.from({ length: 64 }, (_, i) => i);
  return (
    <View style={styles.board}>
      <View style={styles.boardGrid} accessibilityElementsHidden>
        {cells.map((i) => (
          <View
            key={i}
            style={[styles.boardCell, i % 2 === Math.floor(i / 8) % 2 ? styles.boardA : styles.boardB]}
          />
        ))}
      </View>
      <View style={styles.boardFront}>{children}</View>
    </View>
  );
}

export default function ShareStickerSheet({
  visible,
  onDismiss,
  variant,
  day,
  text,
  consistency,
  badge,
  children,
}: ShareStickerSheetProps) {
  const shotRef = useRef<ViewShot>(null);
  const empty = variant === "day" ? !day : variant === "text" ? !text : variant === "consistency" ? !consistency : !badge;
  const hasPhoto = Boolean(
    (variant === "day" && day?.photoUri) ||
      (variant === "consistency" && consistency?.photoUri) ||
      (variant === "badge" && badge?.photoUri),
  );
  const photoShared = Boolean(
    (variant === "day" && day?.photoShared) ||
      (variant === "consistency" && consistency?.photoShared) ||
      (variant === "badge" && badge?.photoShared),
  );
  const photo = variant === "text" ? "absent" : photoBackgroundAllowed({ hasPhoto, photoShared });
  const [bg, setBg] = useState<StickerBackground>(() => defaultStickerBackground(photo));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setBg(defaultStickerBackground(photo));
  }, [visible, photo]);

  const liveBg: StickerBackground = bg === "photo" && photo !== "ok" ? "card" : bg;
  const items = photo === "absent" ? [SHARE_BG_CLEAR, "Card"] : [...SHARE_BG_ITEMS];
  const caption =
    liveBg === "clear"
      ? SHARE_CLEAR_CAPTION
      : bg === "photo" && photo === "private"
        ? SHARE_PHOTO_PRIVATE
        : null;
  const copyLine =
    variant === "day" && day
      ? dayStickerCaption(day)
      : variant === "text" && text
        ? `${text.title}. ${text.challengeTitle}.`
        : SHARE_SHEET;

  const capture = useCallback(async () => {
    return shotRef.current?.capture?.();
  }, []);

  const run = useCallback(
    async (kind: "story" | "copy" | "save" | "more") => {
      if (empty || busy) return;
      if (bg === "photo" && photo !== "ok") return;
      setBusy(true);
      try {
        const uri = await capture();
        if (!uri) return;
        if (kind === "story") {
          await shareToInstagramStory(uri, { asSticker: liveBg === "clear" });
          return;
        }
        if (kind === "copy") {
          await sharePlainMessage(copyLine, SHARE_COPY);
          return;
        }
        await shareProgressImage(uri, copyLine);
      } finally {
        setBusy(false);
      }
    },
    [bg, busy, capture, copyLine, empty, liveBg, photo],
  );

  const preview = useMemo(() => {
    if (variant === "text" && text) {
      return (
        <View style={{ width: STICKER_W }}>
          <FinishTextCard
            challengeTitle={text.challengeTitle}
            title={text.title}
            dayN={text.dayN}
            durationDays={text.durationDays}
            gateLine={text.gateLine}
          />
        </View>
      );
    }
    if (variant === "day" && day) {
      return (
        <DaySticker
          bg={liveBg}
          challenge={day.challenge}
          day={day.day}
          durationDays={day.durationDays}
          proof={day.proof}
          photoUri={day.photoUri}
        />
      );
    }
    if (variant === "consistency" && consistency) {
      return (
        <ConsistencySticker
          bg={liveBg}
          secured={consistency.secured}
          closed={consistency.closed}
          cameraSecured={consistency.cameraSecured}
          last28={consistency.last28}
          photoUri={consistency.photoUri}
        />
      );
    }
    if (variant === "badge" && badge) {
      return (
        <BadgeSticker
          bg={liveBg}
          count={badge.count}
          secured={badge.secured}
          byCamera={badge.byCamera}
          earnedOn={badge.earnedOn}
          photoUri={badge.photoUri}
        />
      );
    }
    return null;
  }, [badge, consistency, day, liveBg, text, variant]);

  return (
    <Sheet visible={visible} onDismiss={onDismiss} heading={SHARE_SHEET}>
      {children}
      {empty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{SHARE_EMPTY}</Text>
          <Text style={styles.emptyHint}>{SHARE_EMPTY_HINT}</Text>
        </View>
      ) : (
        <>
          <Checkerboard>
            <ViewShot
              ref={shotRef}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={liveBg === "clear" ? styles.shotClear : styles.shot}
            >
              {preview}
            </ViewShot>
          </Checkerboard>
          <SegmentedControl
            items={items}
            value={segmentFromBackground(bg)}
            onChange={(v) => {
              const next = backgroundFromSegment(v);
              if (v === SHARE_BG_PHOTO && photo !== "ok") {
                setBg("photo");
                return;
              }
              setBg(next);
            }}
          />
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={SHARE_STORY}
              submitting={busy}
              disabled={empty || (bg === "photo" && photo !== "ok")}
              onPress={() => void run("story")}
            />
            <View style={styles.row}>
              <Pressable
                style={styles.hit}
                onPress={() => void run("copy")}
                accessibilityRole="button"
                accessibilityLabel={SHARE_COPY}
              >
                <Text style={styles.hitLabel}>{SHARE_COPY}</Text>
              </Pressable>
              <Pressable
                style={styles.hit}
                onPress={() => void run("save")}
                accessibilityRole="button"
                accessibilityLabel={SHARE_SAVE}
              >
                <Text style={styles.hitLabel}>{SHARE_SAVE}</Text>
              </Pressable>
              <Pressable
                style={styles.hit}
                onPress={() => void run("more")}
                accessibilityRole="button"
                accessibilityLabel={SHARE_MORE}
              >
                <Text style={styles.hitLabel}>{SHARE_MORE}</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </Sheet>
  );
}

const CELL = STICKER_W / 8;

const styles = StyleSheet.create({
  board: {
    width: STICKER_W,
    alignSelf: "center",
    marginBottom: DS_V3.space.md,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
  },
  boardGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  boardCell: { width: CELL, height: CELL },
  boardA: { backgroundColor: DS_V3.color.border },
  boardB: { backgroundColor: DS_V3.color.surface },
  boardFront: { minHeight: 180, alignItems: "center", justifyContent: "center" },
  shot: { backgroundColor: DS_V3.color.canvas },
  shotClear: { backgroundColor: "transparent" },
  caption: {
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.sm,
  },
  actions: { gap: DS_V3.space.sm, marginTop: DS_V3.space.md },
  row: { flexDirection: "row", justifyContent: "center", gap: 8 },
  hit: { width: 64, height: 44, alignItems: "center", justifyContent: "center" },
  hitLabel: { fontSize: 11, lineHeight: 14, color: DS_V3.color.textSecondary },
  empty: { paddingVertical: DS_V3.space.section, gap: DS_V3.space.sm },
  emptyTitle: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  emptyHint: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
});
