/**
 * Frame 60 — date-sectioned camera proofs. Self-reported days get no tile.
 */
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Camera, Lock } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import {
  PROOFS_EMPTY_HEADING,
  PROOFS_PHOTO_NOT_SAVED,
  proofsCountLine,
  proofsEmptyBody,
  proofsSectionShowsChallenge,
  proofsSections,
  proofsTileA11y,
  proofsTileIsMissing,
  proofsTileLabel,
  type ProofsGridItem,
} from "@/lib/proofs-grid";

const TILE_GAP = 6;
const LABEL = 12;
const LOCK = 12;

function ProofTile({
  item,
  showChallenge,
  onOpen,
}: {
  item: ProofsGridItem;
  showChallenge: boolean;
  onOpen: (item: ProofsGridItem) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [bytes, setBytes] = useState<number | null>(item.bytes ?? null);
  const missing = proofsTileIsMissing({ failed, bytes });
  const label = proofsTileLabel(item, showChallenge);

  useEffect(() => {
    if (item.bytes != null || failed) return;
    let cancelled = false;
    fetch(item.uri, { method: "HEAD" })
      .then((res) => {
        const raw = res.headers.get("content-length");
        const n = raw ? Number(raw) : NaN;
        if (!cancelled && Number.isFinite(n)) setBytes(n);
      })
      .catch(() => {
        /* onError still covers a failed body */
      });
    return () => {
      cancelled = true;
    };
  }, [item.bytes, item.uri, failed]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        missing
          ? `${PROOFS_PHOTO_NOT_SAVED}, ${proofsTileA11y(item.taskName, item.dateKey, item.shared)}`
          : proofsTileA11y(item.taskName, item.dateKey, item.shared)
      }
      onPress={() => onOpen(item)}
      style={styles.tile}
    >
      {missing ? (
        <View style={styles.missing}>
          <Text style={styles.missingCaption}>{PROOFS_PHOTO_NOT_SAVED}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: item.uri }}
          style={styles.img}
          contentFit="cover"
          cachePolicy="memory-disk"
          onError={() => setFailed(true)}
        />
      )}
      <Text style={styles.burn} numberOfLines={1}>
        {label}
      </Text>
      {item.shared ? null : (
        <View style={styles.lock} accessibilityElementsHidden importantForAccessibility="no">
          <Lock size={LOCK} color={DS_V3.color.textPrimary} />
        </View>
      )}
    </Pressable>
  );
}

export default function ProofsGrid({
  items,
  selfReportedDays,
  onOpen,
}: {
  items: ProofsGridItem[];
  selfReportedDays: number;
  onOpen: (item: ProofsGridItem) => void;
}) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.glyph}>
          <Camera size={DS_V3.space.lg + DS_V3.space.sm} color={DS_V3.color.textPrimary} />
        </View>
        <Text style={styles.heading}>{PROOFS_EMPTY_HEADING}</Text>
        <Text style={styles.body}>{proofsEmptyBody(selfReportedDays)}</Text>
      </View>
    );
  }

  const sections = proofsSections(items);
  return (
    <View style={styles.wrap}>
      {sections.map((section) => {
        const showChallenge = proofsSectionShowsChallenge(section.items);
        return (
          <View key={section.dateKey} style={styles.section}>
            <Text style={styles.header}>{section.label}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <ProofTile
                  key={item.id}
                  item={item}
                  showChallenge={showChallenge}
                  onOpen={onOpen}
                />
              ))}
            </View>
          </View>
        );
      })}
      <Text style={styles.count}>{proofsCountLine(items.length)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.lg,
  },
  section: {
    gap: DS_V3.space.sm,
  },
  header: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    color: DS_V3.color.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: TILE_GAP,
  },
  tile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: DS_V3.radius.input,
    overflow: "hidden",
    borderWidth: DS_V3.space.xs / 4,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
  },
  img: {
    width: "100%",
    height: "100%",
  },
  missing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.sm,
  },
  missingCaption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  burn: {
    position: "absolute",
    left: DS_V3.space.sm,
    right: DS_V3.space.lg,
    bottom: 6,
    fontSize: LABEL,
    lineHeight: 16,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  lock: {
    position: "absolute",
    right: DS_V3.space.sm,
    bottom: 6,
  },
  count: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  empty: {
    paddingTop: 60,
    paddingHorizontal: DS_V3.space.gutter,
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
});
