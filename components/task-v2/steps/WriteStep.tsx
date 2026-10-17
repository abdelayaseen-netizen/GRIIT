/**
 * Writing task step — Chunk M frame 40.
 * Bare TextInput on canvas. PushedHeader owns the chrome. Submit stays onPost.
 */
import React, { useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import KeyboardDock from "@/components/ds/KeyboardDock";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import { wordCount } from "@/lib/task-flow-state";
import {
  WRITE_FOOTER_CAPTION,
  WRITE_PLACEHOLDER,
  WRITE_WORDS_LABEL,
  writeCounterFill,
  writeCounterLabel,
  writeCounterMet,
  writeCtaEnabled,
  writeCtaLabel,
  writeHonestyLine,
  writeStepHeader,
} from "@/lib/write-step";

type Props = {
  text: string;
  minWords: number;
  currentDay: number;
  taskName: string;
  headerTitle?: string;
  headerLabel?: string;
  footerCaption?: string;
  footerBrand?: boolean;
  onChangeText: (t: string) => void;
  onPost: () => void;
  onBack: () => void;
  submitting?: boolean;
  /** False after a save, so the native field is gone before the screen leaves. */
  fieldMounted?: boolean;
};

const RULE = DS_V3.space.xs / 2;

export function WriteStep({
  text,
  minWords,
  currentDay,
  taskName,
  headerTitle,
  headerLabel,
  footerCaption = WRITE_FOOTER_CAPTION,
  footerBrand,
  onChangeText,
  onPost,
  onBack,
  submitting = false,
  fieldMounted = true,
}: Props) {
  const written = wordCount(text);
  const met = writeCounterMet(written, minWords);
  const fill = writeCounterFill(written, minWords);
  const enabled = writeCtaEnabled(written, minWords);
  // Build 90 03.3: with the keyboard up, header + title + word bar + footer leave the editor
  // about one line on an iPhone 16, so line 1 scrolls behind the bar. Fold the title while typing.
  const [keyboardUp, setKeyboardUp] = useState(false);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvt, () => setKeyboardUp(true));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      <KeyboardDock
        footer={
          <View style={styles.footer}>
            <Button
              label={writeCtaLabel(written, minWords)}
              variant="primary"
              disabled={!enabled || submitting}
              submitting={submitting}
              onPress={onPost}
            />
            <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
          </View>
        }
      >
      <PushedHeader title={headerTitle ?? writeStepHeader(currentDay)} label={headerLabel} onBack={onBack} />
      <View style={styles.body}>
        {keyboardUp ? null : (
          <>
            <Text style={styles.title}>{taskName}</Text>
            <Text style={styles.honesty}>{writeHonestyLine(minWords)}</Text>
          </>
        )}
        <Text style={styles.wordsLabel}>{WRITE_WORDS_LABEL}</Text>
        <View style={styles.counterBlock}>
          <Text style={[styles.counter, met ? styles.counterMet : null]}>
            {writeCounterLabel(written, minWords)}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(fill * 100)}%` }]} />
          </View>
        </View>
        {fieldMounted ? (
          <TextInput
            testID="write-body"
            accessibilityLabel="Write your entry"
            value={text}
            onChangeText={onChangeText}
            multiline
            style={styles.editor}
            placeholder={WRITE_PLACEHOLDER}
            placeholderTextColor={DS_V3.color.textSecondary}
            textAlignVertical="top"
          />
        ) : (
          <View style={styles.editor} />
        )}
      </View>
      </KeyboardDock>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honesty: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  wordsLabel: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.sm,
  },
  counterBlock: {
    gap: DS_V3.space.xs,
  },
  counter: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  counterMet: {
    color: DS_V3.color.textPrimary,
  },
  track: {
    height: RULE,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
    overflow: "hidden",
  },
  fill: {
    height: RULE,
    backgroundColor: DS_V3.color.primary,
  },
  editor: {
    flex: 1,
    // Build 90 03.3: at least three lines, and the first line starts below the word bar.
    minHeight: DS_V3.type.body.lineHeight * 3,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingTop: DS_V3.space.sm,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    paddingBottom: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  captionBrand: {
    color: DS_V3.color.textPrimary,
  },
});
