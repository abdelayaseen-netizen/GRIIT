/**
 * Writing task step — Chunk M frame 40.
 * Bare TextInput on canvas. PushedHeader owns the chrome. Submit stays onPost.
 */
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  footerCaption?: string;
  footerBrand?: boolean;
  onChangeText: (t: string) => void;
  onPost: () => void;
  onBack: () => void;
};

const RULE = DS_V3.space.xs / 2;

export function WriteStep({
  text,
  minWords,
  currentDay,
  taskName,
  headerTitle,
  footerCaption = WRITE_FOOTER_CAPTION,
  footerBrand,
  onChangeText,
  onPost,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const written = wordCount(text);
  const met = writeCounterMet(written, minWords);
  const fill = writeCounterFill(written, minWords);
  const enabled = writeCtaEnabled(written, minWords);

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <PushedHeader title={headerTitle ?? writeStepHeader(currentDay)} onBack={onBack} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{taskName}</Text>
        <Text style={styles.honesty}>{writeHonestyLine(minWords)}</Text>
        <Text style={styles.wordsLabel}>{WRITE_WORDS_LABEL}</Text>
        <View style={styles.counterBlock}>
          <Text style={[styles.counter, met ? styles.counterMet : null]}>
            {writeCounterLabel(written, minWords)}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(fill * 100)}%` }]} />
          </View>
        </View>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          multiline
          style={styles.editor}
          placeholder={WRITE_PLACEHOLDER}
          placeholderTextColor={DS_V3.color.textSecondary}
          textAlignVertical="top"
        />
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.gutter) }]}>
        <Button
          label={writeCtaLabel(written, minWords)}
          variant="primary"
          disabled={!enabled}
          onPress={onPost}
        />
        <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
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
    color: DS_V3.color.brandText,
  },
  track: {
    height: RULE,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
    overflow: "hidden",
  },
  fill: {
    height: RULE,
    backgroundColor: DS_V3.color.brand,
  },
  editor: {
    flex: 1,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
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
    color: DS_V3.color.brandText,
  },
});
