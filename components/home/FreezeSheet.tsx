import React from "react";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { Pressable, Text, StyleSheet } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { FREEZE, FREEZE_LINE } from "@/lib/copy";
import { NOT_NOW } from "@/lib/v44-detail";
import {
  CLOSE,
  SEE_PRO,
  freezeNoneShowsSeePro,
  freezeSheetVariant,
} from "@/lib/freeze-sheet";

export type FreezeSheetProps = {
  visible: boolean;
  remaining: number;
  restoredStreakDays?: number;
  lastFreezeUsedAt?: string | null;
  timeZone: string;
  subscriptionStatus?: string | null;
  submitting?: boolean;
  onUseFreeze: () => void;
  onRefuse: () => void;
  onSeePro: () => void;
  onClose: () => void;
  error?: string | null;
};

export function FreezeSheet({
  visible,
  remaining,
  restoredStreakDays: _restoredStreakDays,
  subscriptionStatus,
  submitting,
  onUseFreeze,
  onRefuse,
  onSeePro,
  onClose,
  error,
}: FreezeSheetProps) {
  const variant = freezeSheetVariant(remaining);
  if (variant === "none") {
    return (
      <Sheet
        visible={visible}
        onDismiss={onClose}
        heading={FREEZE.none}
        footer={
          <>
            {freezeNoneShowsSeePro(subscriptionStatus) ? (
              <Button label={SEE_PRO} onPress={onSeePro} />
            ) : null}
            <Button label={CLOSE} variant="tertiary" onPress={onClose} />
          </>
        }
      >
        <Text style={styles.body}>{FREEZE.none}</Text>
      </Sheet>
    );
  }
  return (
    <Sheet
      visible={visible}
      onDismiss={onClose}
      heading={FREEZE.sheetTitle("yesterday")}
      footer={
        <>
          <Button label={FREEZE.button} onPress={onUseFreeze} submitting={submitting} />
          <Pressable accessibilityRole="button" accessibilityLabel={NOT_NOW} onPress={onRefuse}>
            <Text style={styles.notNow}>{NOT_NOW}</Text>
          </Pressable>
        </>
      }
    >
      <Text style={styles.body}>{FREEZE_LINE}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  notNow: {
    minHeight: DS_V3.size.tap,
    textAlign: "center",
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
    marginTop: DS_V3.space.sm,
  },
});
