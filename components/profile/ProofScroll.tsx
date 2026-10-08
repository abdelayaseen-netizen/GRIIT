/**
 * Vertical proof list. One entry per proof, newest first as the record returns them.
 * Photo entries keep a 4:5 frame. Self-reported entries use a surface card.
 */
import React, { useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Check } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { dayLine } from "@/lib/story-card";
import { proofsDateLabel, type ProofsGridItem } from "@/lib/proofs-grid";
import { ProofPhoto } from "@/components/ds/ProofFallbackTile";

const HEADER = 88;
const CAPTION = 72;

function selfReportedLine(capturedAt: string | null): string {
  if (!capturedAt) return "Self-reported";
  const d = new Date(capturedAt);
  if (Number.isNaN(d.getTime())) return "Self-reported";
  const clock = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .toLowerCase();
  return `Self-reported · ${clock}`;
}

export function ProofScroll({
  items,
  initialId,
  onIndexChange,
}: {
  items: ProofsGridItem[];
  initialId?: string;
  onIndexChange?: (item: ProofsGridItem, index: number) => void;
}) {
  const { width } = useWindowDimensions();
  const photoW = Math.max(1, width - DS_V3.space.gutter * 2);
  const photoH = Math.round(photoW * 1.25);
  const itemH = HEADER + photoH + CAPTION;
  const initialIndex = useMemo(() => {
    if (!initialId) return 0;
    const i = items.findIndex((item) => item.id === initialId);
    return i >= 0 ? i : 0;
  }, [initialId, items]);
  const changeRef = useRef(onIndexChange);
  changeRef.current = onIndexChange;
  const onViewable = useRef(
    ({ viewableItems }: { viewableItems: { item?: ProofsGridItem; index: number | null }[] }) => {
      const first = viewableItems[0];
      if (first?.item) changeRef.current?.(first.item, first.index ?? 0);
    },
  ).current;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      initialScrollIndex={items.length > 0 ? initialIndex : undefined}
      getItemLayout={(_data, index) => ({ length: itemH, offset: itemH * index, index })}
      initialNumToRender={2}
      windowSize={5}
      onViewableItemsChanged={onViewable}
      viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      renderItem={({ item }) => {
        const photo = Boolean(item.uri);
        return (
          <View style={[styles.entry, { height: itemH }]}>
            <Text style={styles.meta}>
              {proofsDateLabel(item.dateKey)} · {item.challengeName} · {dayLine(item.day, item.durationDays)} · {item.taskName}
            </Text>
            <Text style={styles.share}>{item.shared ? "Shared" : "Private"}</Text>
            {photo ? (
              <View style={{ width: photoW, height: photoH }}>
                <ProofPhoto uri={item.uri} taskName={item.taskName} style={styles.photo} />
              </View>
            ) : (
              <View style={[styles.self, { width: photoW, height: photoH }]}>
                <Check size={22} color={DS_V3.color.brand} />
                <Text style={styles.task}>{item.taskName || "Task"}</Text>
                <Text style={styles.selfLine}>{selfReportedLine(item.capturedAt)}</Text>
              </View>
            )}
            {item.shared ? null : <Text style={styles.private}>Only you can see this.</Text>}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  entry: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  meta: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  share: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textPrimary,
  },
  photo: { width: "100%", height: "100%" },
  self: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
    padding: DS_V3.space.gutter,
  },
  task: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  selfLine: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  private: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});
