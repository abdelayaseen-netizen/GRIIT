import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import {
  dayViewerCountLabel,
  dayViewerCursorFromPage,
  dayViewerNextDayHint,
  dayViewerPageFromCursor,
  dayViewerPages,
  dayViewerPhotoCount,
} from "@/lib/day-viewer-nav";
import type { ProofsGridItem } from "@/lib/proofs-grid";

export function dayViewerShareCopy(shared: boolean, unanswered: boolean): string {
  if (shared) return "Shared to the feed.";
  if (unanswered) return "Only you can see this. Share it from here.";
  return "Only you can see this.";
}

export function DayViewer({
  items,
  initialDateKey,
  isOwner,
  onShare,
  onDateKeyChange,
}: {
  items: ProofsGridItem[];
  initialDateKey?: string;
  isOwner: boolean;
  onShare?: (item: ProofsGridItem) => void;
  onDateKeyChange?: (dateKey: string) => void;
}) {
  const { width } = useWindowDimensions();
  const photoWidth = width - DS_V3.space.gutter * 2;
  const photoHeight = photoWidth * (5 / 4);
  const visible = useMemo(
    () => (isOwner ? items : items.filter((i) => i.shared)),
    [items, isOwner],
  );
  const pages = useMemo(() => dayViewerPages(visible), [visible]);
  const startPage = useMemo(() => {
    if (!initialDateKey) return 0;
    const idx = dayViewerPageFromCursor(pages, { dateKey: initialDateKey, photoIndex: 0 });
    return idx >= 0 ? idx : 0;
  }, [pages, initialDateKey]);
  const [pageIndex, setPageIndex] = useState(startPage);

  useEffect(() => {
    setPageIndex(startPage);
  }, [startPage]);

  const item = pages[pageIndex] ?? pages[0];
  const cursor = dayViewerCursorFromPage(pages, pageIndex);
  const dayCount = cursor ? dayViewerPhotoCount(pages, cursor.dateKey) : 0;
  const countLabel = cursor ? dayViewerCountLabel(cursor, dayCount) : "1 of 1";

  if (!item || !cursor) {
    return (
      <View style={styles.empty}>
        <Text style={styles.body}>No days with photos</Text>
      </View>
    );
  }

  const unanswered = isOwner && item.shareState === "unanswered";
  const canShare = unanswered;
  const hint = dayViewerNextDayHint({ pages, pageIndex, isOwner });

  return (
    <View style={styles.wrap}>
      <Text style={styles.header} accessibilityLabel={countLabel}>
        {countLabel}
      </Text>
      <View style={styles.segments} accessibilityElementsHidden>
        {Array.from({ length: Math.max(1, dayCount) }, (_, i) => (
          <View key={i} style={[styles.seg, i <= cursor.photoIndex ? styles.segOn : styles.segOff]} />
        ))}
      </View>
      <FlatList
        data={pages}
        key={pages.map((p) => p.id).join("|")}
        horizontal
        pagingEnabled
        directionalLockEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        style={{ height: photoHeight }}
        initialScrollIndex={startPage}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        keyExtractor={(row) => row.id}
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / width);
          if (next === pageIndex || next < 0 || next >= pages.length) return;
          setPageIndex(next);
          const nextCursor = dayViewerCursorFromPage(pages, next);
          if (nextCursor) onDateKeyChange?.(nextCursor.dateKey);
        }}
        renderItem={({ item: row }) => (
          <View style={{ width, height: photoHeight }}>
            <Image
              source={{ uri: row.uri }}
              style={{
                width: photoWidth,
                height: photoHeight,
                marginHorizontal: DS_V3.space.gutter,
                borderRadius: 14,
                backgroundColor: DS_V3.color.surface,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
        )}
      />
      <Text style={styles.eyebrow}>{item.challengeName}</Text>
      <Text style={styles.subject}>{item.taskName}</Text>
      {!item.shared && isOwner ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>Private</Text>
        </View>
      ) : null}
      <Text style={styles.caption}>{dayViewerShareCopy(item.shared, unanswered)}</Text>
      {canShare && onShare ? (
        <Button label="Share to the feed" onPress={() => onShare(item)} />
      ) : null}
      {hint ? <Text style={styles.caption}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: DS_V3.color.canvas, paddingTop: DS_V3.space.sm, gap: DS_V3.space.sm },
  empty: { padding: DS_V3.space.gutter },
  header: {
    ...DS_V3.type.label,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.gutter,
  },
  segments: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: DS_V3.space.gutter,
  },
  seg: { flex: 1, height: 2, borderRadius: 2 },
  segOn: { backgroundColor: DS_V3.color.brand },
  segOff: { backgroundColor: DS_V3.color.border },
  eyebrow: {
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.gutter,
  },
  subject: {
    ...DS_V3.type.bodyStrong,
    color: DS_V3.color.textPrimary,
    paddingHorizontal: DS_V3.space.gutter,
  },
  body: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  pill: {
    alignSelf: "flex-start",
    marginHorizontal: DS_V3.space.gutter,
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.pill,
    paddingHorizontal: DS_V3.space.sm,
    paddingVertical: DS_V3.space.xs,
  },
  pillText: { ...DS_V3.type.label, color: DS_V3.color.textSecondary, textTransform: "none", letterSpacing: 0 },
  caption: {
    ...DS_V3.type.caption,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.gutter,
  },
});
