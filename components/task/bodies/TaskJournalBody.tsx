/**
 * Journal · Write body — TONIGHT'S PROMPT (when configured) + editor + Saved footer.
 * No camera / image-picker. Prompt card omitted when prompt is empty (no fabrication).
 */
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type TaskJournalValue = { text: string };

export type TaskJournalBodyProps = {
  value: TaskJournalValue;
  onChangeText: (text: string) => void;
  /** Real config.journal_prompt only — empty means hide the prompt card. */
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
  const promptText = prompt.trim();
  const floor = minWords > 0 ? minWords : 0;
  const progress =
    floor > 0 ? Math.min(1, wordCount / floor) : wordCount > 0 ? 1 : 0;
  const footerLabel =
    floor > 0
      ? `Saved · ${wordCount} / ${floor} words`
      : `Saved · ${wordCount} word${wordCount === 1 ? "" : "s"}`;

  return (
    <View style={styles.wrap}>
      {promptText ? (
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>TONIGHT&apos;S PROMPT</Text>
          <Text style={styles.promptText}>{promptText}</Text>
        </View>
      ) : null}

      <View style={styles.editorCard}>
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
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>{footerLabel}</Text>
          {floor > 0 ? (
            <View
              style={styles.progressTrack}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: floor,
                now: Math.min(wordCount, floor),
              }}
            >
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  promptCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: DS_SPACING_V2.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: DS_SPACING_V2.sm,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.6,
    color: DS_COLORS_V2.text.secondary,
  },
  promptText: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.primary,
    lineHeight: 22,
  },
  editorCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: DS_SPACING_V2.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: DS_SPACING_V2.sm,
    minHeight: 220,
  },
  textInput: {
    fontSize: 16,
    fontWeight: "400",
    color: DS_COLORS_V2.text.primary,
    minHeight: 160,
    lineHeight: 24,
    flexGrow: 1,
  },
  footer: {
    gap: DS_SPACING_V2.xs,
    paddingTop: DS_SPACING_V2.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_COLORS_V2.surface.divider,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
});
