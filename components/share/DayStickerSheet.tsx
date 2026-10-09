/**
 * Frame 111 share sheet. Which day = challenges secured today, only when more than one.
 */
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import ShareStickerSheet from "@/components/share/ShareStickerSheet";
import { shareDayCells } from "@/lib/share-image";
import { DONE_FOR_TODAY } from "@/lib/challenge-today-copy";
import {
  WHICH_DAY,
  defaultShareTodayChallenge,
  shareTodayPickerLine,
  showWhichDayPicker,
  type ShareTodayChallenge,
} from "@/lib/day-sticker";

export type DayStickerSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  challenges: readonly ShareTodayChallenge[];
  preselectedId?: string | null;
  proofUri?: string;
  photoShared?: boolean;
  username?: string | null;
  streak?: number;
  longestStreak?: number;
  activeLine?: string;
  todayKey?: string;
  securedDateKeys?: readonly string[];
  frozenDateKeys?: readonly string[];
};

export default function DayStickerSheet({
  visible,
  onDismiss,
  challenges,
  preselectedId,
  proofUri,
  photoShared = false,
  username,
  streak,
  longestStreak,
  activeLine,
  todayKey,
  securedDateKeys = [],
  frozenDateKeys = [],
}: DayStickerSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId ?? null);
  const selected =
    challenges.find((c) => c.id === selectedId) ?? defaultShareTodayChallenge(challenges, preselectedId);
  const cells =
    selected?.startDateKey && todayKey && selected.dayTotal
      ? shareDayCells({
          startDateKey: selected.startDateKey,
          durationDays: selected.dayTotal,
          todayKey,
          securedDateKeys,
          frozenDateKeys,
        })
      : undefined;
  const securedCount = cells?.filter((cell) => cell === "secured").length;
  const showPicker = showWhichDayPicker(challenges);

  useEffect(() => {
    if (!visible) return;
    setSelectedId(defaultShareTodayChallenge(challenges, preselectedId)?.id ?? null);
  }, [visible, challenges, preselectedId]);

  return (
    <ShareStickerSheet
      visible={visible}
      onDismiss={onDismiss}
      variant="day"
      moment="day_secured"
      username={username}
      inviteCode={selected?.inviteCode}
      streak={streak}
      longestStreak={longestStreak}
      activeLine={activeLine ?? challenges.map((c) => c.name).filter(Boolean).join(" · ")}
      day={
        selected
          ? {
              challenge: selected.name,
              day: selected.day,
              durationDays: selected.dayTotal ?? selected.day,
              proof: selected.proof ?? ((selected.photoCount ?? 0) > 0 ? "camera" : "self"),
              status: selected.stickerKind === "challenge" ? DONE_FOR_TODAY : STICKER_SECURED,
              photoUri: proofUri,
              photoShared,
              cells,
              secured: securedCount,
              cameraSeal: (selected.proof ?? "self") !== "self" && Boolean(proofUri),
            }
          : undefined
      }
    >
      {showPicker ? (
        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>{WHICH_DAY}</Text>
          {challenges.map((challenge) => {
            const on = challenge.id === selected?.id;
            return (
              <Pressable
                key={challenge.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={challenge.name}
                onPress={() => setSelectedId(challenge.id)}
                style={styles.option}
              >
                <View style={[styles.radio, on ? styles.radioOn : null]} />
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{challenge.name}</Text>
                  <Text style={styles.optionCap}>{shareTodayPickerLine(challenge)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </ShareStickerSheet>
  );
}

const RADIO = DS_V3.space.gutter;
const STROKE = (DS_V3.space.xs * 3) / 8;

const styles = StyleSheet.create({
  picker: {
    gap: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.gutter,
  },
  pickerLabel: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  radio: {
    width: RADIO,
    height: RADIO,
    borderRadius: DS_V3.radius.pill,
    borderWidth: STROKE,
    borderColor: DS_V3.color.textSecondary,
  },
  radioOn: {
    backgroundColor: DS_V3.color.textPrimary,
    borderColor: DS_V3.color.textPrimary,
  },
  optionCopy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  optionTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  optionCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
