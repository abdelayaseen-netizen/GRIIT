/**
 * Frame 111 share sheet. Which day = challenges secured today, only when more than one.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";
import ShareCardV3 from "@/components/share/ShareCardV3";
import {
  DAY_STICKER_SHARE,
  WHICH_DAY,
  dayStickerCopy,
  defaultShareTodayChallenge,
  shareTodayPickerLine,
  showWhichDayPicker,
  type ShareTodayChallenge,
} from "@/lib/day-sticker";
import { shareProgressImage } from "@/lib/share";

export type DayStickerSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  challenges: readonly ShareTodayChallenge[];
  preselectedId?: string | null;
  proofUri?: string;
};

export default function DayStickerSheet({
  visible,
  onDismiss,
  challenges,
  preselectedId,
  proofUri,
}: DayStickerSheetProps) {
  const shotRef = useRef<ViewShot>(null);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId ?? null);
  const selected =
    challenges.find((c) => c.id === selectedId) ?? defaultShareTodayChallenge(challenges, preselectedId);
  const copy = selected ? dayStickerCopy(selected) : "";
  const [sharing, setSharing] = useState(false);
  const showPicker = showWhichDayPicker(challenges);

  useEffect(() => {
    if (!visible) return;
    setSelectedId(defaultShareTodayChallenge(challenges, preselectedId)?.id ?? null);
  }, [visible, challenges, preselectedId]);

  const share = useCallback(async () => {
    if (!selected || sharing) return;
    setSharing(true);
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri) await shareProgressImage(uri, copy);
    } finally {
      setSharing(false);
    }
  }, [copy, selected, sharing]);

  return (
    <Sheet
      visible={visible}
      onDismiss={onDismiss}
      heading={DAY_STICKER_SHARE}
      footer={
        <Button
          label={DAY_STICKER_SHARE}
          submitting={sharing}
          disabled={!selected}
          onPress={() => void share()}
        />
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
      <View pointerEvents="none" style={styles.offscreen} accessibilityElementsHidden>
        {selected ? (
          <ShareCardV3
            ref={shotRef}
            size="story"
            streak={selected.day}
            copy={copy}
            proofUri={proofUri}
            label="Verified"
          />
        ) : null}
      </View>
    </Sheet>
  );
}

const RADIO = DS_V3.space.gutter;
const STROKE = (DS_V3.space.xs * 3) / 8;

const styles = StyleSheet.create({
  picker: {
    gap: DS_V3.space.md,
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
    backgroundColor: DS_V3.color.brand,
    borderColor: DS_V3.color.brand,
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
  offscreen: {
    position: "absolute",
    left: -4000,
    top: 0,
  },
});
