/**
 * Journal body — daily prompt + auto-saved indicator + word counter.
 *
 * Parent owns the `useJournalInput` state; this component just receives
 * the controlled text + counter values.
 */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Camera, SmilePlus, Tag } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export type TaskJournalValue = { text: string };

export type TaskJournalBodyProps = {
  value: TaskJournalValue;
  onChangeText: (text: string) => void;
  prompt: string;
  wordCount: number;
  minWords: number;
};

export function TaskJournalBody({
  value,
  onChangeText,
  prompt,
  wordCount,
  minWords,
}: TaskJournalBodyProps) {
  const reachedMin = minWords === 0 || wordCount >= minWords;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>TODAY&apos;S PROMPT</Text>
          <Text style={styles.savedHint}>Auto-saved</Text>
        </View>
        <View style={styles.promptChip}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <TextInput
          accessibilityLabel="Journal entry"
          value={value.text}
          onChangeText={onChangeText}
          multiline
          placeholder="Write what's on your mind…"
          placeholderTextColor={DS_COLORS_V2.text.tertiary}
          style={styles.textInput}
          textAlignVertical="top"
        />
        <View style={styles.divider} />
        <View style={styles.counterRow}>
          {minWords > 0 ? (
            <Text
              style={[
                styles.counterText,
                reachedMin ? styles.counterOk : styles.counterShort,
              ]}
            >
              {reachedMin
                ? `${wordCount} / ${minWords} ✓`
                : `${wordCount} / ${minWords} words`}
            </Text>
          ) : (
            <Text style={[styles.counterText, styles.counterOk]}>
              {`${wordCount} word${wordCount === 1 ? "" : "s"}`}
            </Text>
          )}
          <View style={styles.tagsRow}>
            <PlaceholderChip
              icon={
                <SmilePlus
                  size={11}
                  color={DS_COLORS_V2.text.secondary}
                  strokeWidth={2}
                />
              }
              label="Mood"
            />
            <PlaceholderChip
              icon={
                <Tag
                  size={11}
                  color={DS_COLORS_V2.text.secondary}
                  strokeWidth={2}
                />
              }
              label="Wins"
            />
            <PlaceholderChip
              icon={
                <Camera
                  size={11}
                  color={DS_COLORS_V2.text.secondary}
                  strokeWidth={2}
                />
              }
              label="Photo"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PlaceholderChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${label.toLowerCase()} (coming soon)`}
      onPress={() => undefined}
      style={({ pressed }) => [styles.chip, pressed ? styles.pressed : null]}
    >
      {icon}
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  card: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  savedHint: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.success,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderRadius: DS_RADIUS_V2.sm,
  },
  promptText: {
    fontSize: 13,
    color: DS_COLORS_V2.text.primary,
    lineHeight: 18,
  },

  textInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    minHeight: 160,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  counterText: {
    fontSize: 11,
    fontWeight: "500",
  },
  counterShort: { color: DS_COLORS_V2.semantic.danger },
  counterOk: { color: DS_COLORS_V2.semantic.success },
  tagsRow: { flexDirection: "row", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  pressed: { opacity: 0.85 },
});

export default TaskJournalBody;
