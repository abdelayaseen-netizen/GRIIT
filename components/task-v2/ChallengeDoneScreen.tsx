/**
 * Task done, day still open — frame 48.
 * No PushedHeader. No display face. No streak number.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight, CircleDashed } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Divider from "@/components/ds/Divider";
import { StatusRing } from "@/components/home/HomeV3";
import {
  DAY_OPEN_ALSO,
  DAY_OPEN_DONE,
  DAY_OPEN_NEXT,
  type DayOpenAlso,
  type DayOpenModel,
} from "@/lib/day-open";
import { homeProofTitleMuted, type HomeProofRow } from "@/lib/home-proof-card";

const RING = DS_V3.space.gutter;

export default function ChallengeDoneScreen({
  model,
  onOpenTask,
  onNext,
  onDone,
}: {
  model: DayOpenModel;
  onOpenTask: (id: string) => void;
  onNext: () => void;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const renderRow = (row: HomeProofRow) => {
    const pending = !row.done && !row.closed;
    const inner = (
      <>
        <StatusRing row={row} />
        <View style={styles.taskCopy}>
          <Text style={[styles.task, homeProofTitleMuted(row) ? styles.taskMuted : null]}>{row.name}</Text>
          <Text style={styles.caption}>{row.caption}</Text>
        </View>
        {pending ? (
          <ChevronRight size={RING} color={DS_V3.color.textSecondary} accessibilityLabel="Open" />
        ) : null}
      </>
    );
    if (!pending) {
      return (
        <View key={row.id} style={styles.proofRow}>
          {inner}
        </View>
      );
    }
    return (
      <Pressable
        key={row.id}
        accessibilityRole="button"
        accessibilityLabel={row.name}
        onPress={() => onOpenTask(row.id)}
        style={styles.proofRow}
      >
        {inner}
      </Pressable>
    );
  };

  const renderAlso = (row: DayOpenAlso) => (
    <Pressable
      key={row.id}
      accessibilityRole="button"
      accessibilityLabel={row.line}
      onPress={() => (row.nextId ? onOpenTask(row.nextId) : undefined)}
      style={styles.proofRow}
    >
      <CircleDashed size={RING} color={DS_V3.color.textSecondary} />
      <Text style={[styles.task, styles.flex]}>{row.line}</Text>
      <ChevronRight size={RING} color={DS_V3.color.textSecondary} accessibilityLabel="Open" />
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + DS_V3.size.tap, paddingBottom: insets.bottom + DS_V3.space.section * 4 },
        ]}
      >
        <Text style={styles.title}>{model.title}</Text>
        <Text style={styles.left}>{model.leftLine}</Text>
        <Text style={styles.label}>{model.contextLine}</Text>
        {model.rows.map(renderRow)}
        {model.alsoToday.length > 0 ? (
          <>
            <Divider style={styles.alsoDivider} />
            <Text style={styles.label}>{DAY_OPEN_ALSO}</Text>
            {model.alsoToday.map(renderAlso)}
          </>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        <Button label={DAY_OPEN_NEXT} onPress={onNext} />
        <Button label={DAY_OPEN_DONE} variant="tertiary" ink onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  left: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.sm,
  },
  alsoDivider: {
    marginTop: DS_V3.space.lg,
  },
  proofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  taskCopy: { flex: 1, gap: DS_V3.space.xs / 2 },
  flex: { flex: 1 },
  task: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskMuted: {
    color: DS_V3.color.textSecondary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
