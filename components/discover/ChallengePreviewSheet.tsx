/**
 * Before joining. v48 frame 533. Does not join until the button is pressed.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions } from "react-native";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { Cover, type CoverCategory } from "@/components/ds/Cover";
import Chip from "@/components/ds/Chip";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import { JOIN_CAPTION_TODAY } from "@/lib/challenge-detail-mapping";
import { startedPreviewCopy } from "@/lib/feed-join";
import type { DiscoverPreviewTask } from "@/lib/discover-preview-tasks";
import type { FeaturedBuiltin } from "@/lib/featured-catalog";

export type ChallengePreview = {
  id: string;
  title: string;
  category: CoverCategory;
  days: number;
  people?: number;
  description?: string;
  taskTitle?: string;
  proof?: string;
  window?: string;
  modeLine: string;
  difficulty?: string;
  tasks?: DiscoverPreviewTask[];
  day1Line: string;
  builtin?: FeaturedBuiltin | null;
};

export function ChallengePreviewSheet({
  item,
  joining,
  enrolled,
  onJoin,
  onOpen,
  onDetails,
  onClose,
}: {
  item: ChallengePreview | null;
  joining?: boolean;
  enrolled?: { day: number; total: number } | null;
  onJoin: (item: ChallengePreview) => void;
  onOpen?: (item: ChallengePreview) => void;
  onDetails: (item: ChallengePreview) => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  if (!item) return null;
  const coverW = Math.max(200, Math.round(width - DS_V3.space.gutter * 4));
  const people =
    item.people == null
      ? null
      : item.people === 1
        ? "1 person"
        : `${item.people.toLocaleString("en-US")} people`;
  const meta = [formatDays(item.days), item.category, people].filter(Boolean).join(" · ");
  const preview = startedPreviewCopy(enrolled ?? null);
  const joinLabel = preview.open ? preview.label : `Join ${item.title}`;

  return (
    <Sheet
      visible
      onDismiss={onClose}
      heading=""
      footer={
        <>
          <Text style={styles.day}>{preview.open ? preview.line : item.day1Line || JOIN_CAPTION_TODAY}</Text>
          <Button
            label={joinLabel}
            onPress={() => (preview.open ? onOpen?.(item) : onJoin(item))}
            submitting={joining}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="See full details" onPress={() => onDetails(item)}>
            <Text style={styles.details}>See full details</Text>
          </Pressable>
        </>
      }
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <Cover category={item.category} title={item.title} days={item.days} width={coverW} height={200} />
        <Text style={styles.meta}>{meta}</Text>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        {(item.tasks ?? []).length > 0 ? <Text style={styles.section}>Every day</Text> : null}
        {(item.tasks ?? []).map((task) => (
          <Text key={task.title} style={styles.row}>
            {task.title}
            {task.gate ? <Text style={styles.rule}>{` · ${task.gate}`}</Text> : null}
          </Text>
        ))}
        {item.difficulty ? <Chip label={item.difficulty} /> : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 420 },
  body: { gap: 8, paddingBottom: 8 },
  meta: { fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  description: { fontSize: 15, lineHeight: 20, color: DS_V3.color.textPrimary },
  section: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: DS_V3.color.textSecondary,
  },
  row: { fontSize: 17, lineHeight: 22, fontWeight: "600", color: DS_V3.color.textPrimary },
  rule: { fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  mode: { marginTop: 8, fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  day: { textAlign: "center", marginBottom: 8, color: DS_V3.color.textSecondary },
  details: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
});
