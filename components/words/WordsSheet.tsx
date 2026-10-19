/**
 * Build 92 10.5 (P3-22, P3-24): the words sheet behind the small "i", and the first freeze earned.
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Info } from "lucide-react-native";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { FREEZE_EARNED, WORDS, WORDS_INFO_LABEL, WORDS_SHEET_TITLE, WORD_ORDER } from "@/lib/words";

export function WordsSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <Sheet visible={visible} onDismiss={onDismiss} heading={WORDS_SHEET_TITLE}>
      <View style={styles.list} testID="words-sheet">
        {WORD_ORDER.map((w) => (
          <View key={w} style={styles.row}>
            <Text style={styles.word}>{w}</Text>
            <Text style={styles.body}>{WORDS[w]}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

/** The small "i": opens the words sheet. Pass `onPress` when the sheet lives higher up. */
export function WordsInfoButton({ testID = "words-info", onPress }: { testID?: string; onPress?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={WORDS_INFO_LABEL}
        hitSlop={12}
        onPress={onPress ?? (() => setOpen(true))}
        style={styles.info}
      >
        <Info size={18} color={DS_V3.color.textSecondary} />
      </Pressable>
      {onPress ? null : <WordsSheet visible={open} onDismiss={() => setOpen(false)} />}
    </>
  );
}

export function FreezeEarnedSheet({
  visible,
  held,
  cap,
  proCap,
  onDismiss,
}: {
  visible: boolean;
  held: number;
  cap: number;
  proCap: number;
  onDismiss: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onDismiss={onDismiss}
      heading={FREEZE_EARNED.title}
      footer={<Button label={FREEZE_EARNED.done} onPress={onDismiss} />}
    >
      <View style={styles.list} testID="freeze-earned">
        <Text style={styles.body}>{FREEZE_EARNED.body}</Text>
        <Text style={styles.count}>{FREEZE_EARNED.count(held, cap, proCap)}</Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: DS_V3.space.md },
  row: { gap: DS_V3.space.xs },
  word: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  count: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  info: { alignSelf: "center", padding: 2 },
});
