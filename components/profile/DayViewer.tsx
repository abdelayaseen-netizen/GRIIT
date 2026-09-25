import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import type { ProofsGridItem } from "@/lib/proofs-grid";

export function dayViewerShareCopy(shared: boolean, unanswered: boolean): string {
  if (shared) return "Shared to the feed.";
  if (unanswered) return "Only you can see this. Share it from here.";
  return "Only you can see this.";
}

export function DayViewer({
  items,
  isOwner,
  onShare,
}: {
  items: ProofsGridItem[];
  isOwner: boolean;
  onShare?: (item: ProofsGridItem) => void;
}) {
  const visible = useMemo(
    () => (isOwner ? items : items.filter((i) => i.shared)),
    [items, isOwner],
  );
  const [index, setIndex] = useState(0);
  const item = visible[index];
  if (!item) {
    return (
      <View style={styles.empty}>
        <Text style={styles.body}>No days with photos</Text>
      </View>
    );
  }
  const n = visible.length;
  // Boolean `shared` cannot tell kept from unanswered (c64). R3: never re-offer Keep.
  // Share only when the tile carries share_state === "unanswered".
  const unanswered = isOwner && item.shareState === "unanswered";
  const canShare = unanswered;
  return (
    <View style={styles.wrap}>
      <Text style={styles.header} accessibilityLabel={`${index + 1} of ${n}`}>
        {index + 1} of {n}
      </Text>
      <Text style={styles.eyebrow}>{item.challengeName}</Text>
      <Text style={styles.subject}>{item.taskName}</Text>
      <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" />
      {!item.shared && isOwner ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>Private</Text>
        </View>
      ) : null}
      <Text style={styles.caption}>{dayViewerShareCopy(item.shared, unanswered)}</Text>
      {canShare && onShare ? (
        <Button label="Share to the feed" onPress={() => onShare(item)} />
      ) : null}
      {index < n - 1 ? (
        <Pressable onPress={() => setIndex((i) => i + 1)} accessibilityRole="button">
          <Text style={styles.caption}>Swipe left at the last photo for the previous day</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: DS_V3.color.canvas, padding: DS_V3.space.gutter, gap: DS_V3.space.sm },
  empty: { padding: DS_V3.space.gutter },
  header: { ...DS_V3.type.label, color: DS_V3.color.textSecondary },
  eyebrow: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  subject: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  body: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  photo: { width: "100%", aspectRatio: 4 / 5, borderRadius: 14, backgroundColor: DS_V3.color.surface },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.pill,
    paddingHorizontal: DS_V3.space.sm,
    paddingVertical: DS_V3.space.xs,
  },
  pillText: { ...DS_V3.type.label, color: DS_V3.color.textSecondary, textTransform: "none", letterSpacing: 0 },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
