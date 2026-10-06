import React from "react";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { Text, StyleSheet } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { FREEZE } from "@/lib/copy";
import {
  CLOSE,
  NO_LET_IT_RESET,
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
  restoredStreakDays,
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
          <Button label={NO_LET_IT_RESET} variant="tertiary" onPress={onRefuse} />
        </>
      }
    >
      <Text style={styles.body}>
        {typeof restoredStreakDays === "number"
          ? FREEZE.sheetBody("yesterday", restoredStreakDays, remaining, "in 30 days")
          : FREEZE.offer(remaining)}
      </Text>
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
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
    marginTop: DS_V3.space.sm,
  },
});
