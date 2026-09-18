import React from "react";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { Text, StyleSheet } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import {
  CLOSE,
  NO_FREEZES_LEFT,
  NO_LET_IT_RESET,
  SEE_PRO,
  USE_A_FREEZE_FOR_YESTERDAY_Q,
  USE_THE_FREEZE,
  freezeNoneBody,
  freezeOfferBody,
  freezeRefillDateLabel,
  freezeSheetVariant,
} from "@/lib/freeze-sheet";

export type FreezeSheetProps = {
  visible: boolean;
  remaining: number;
  restoredStreakDays?: number;
  lastFreezeUsedAt?: string | null;
  timeZone: string;
  submitting?: boolean;
  onUseFreeze: () => void;
  onRefuse: () => void;
  onSeePro: () => void;
  onClose: () => void;
};

export function FreezeSheet({
  visible,
  remaining,
  restoredStreakDays,
  lastFreezeUsedAt,
  timeZone,
  submitting,
  onUseFreeze,
  onRefuse,
  onSeePro,
  onClose,
}: FreezeSheetProps) {
  const variant = freezeSheetVariant(remaining);
  if (variant === "none") {
    return (
      <Sheet
        visible={visible}
        onDismiss={onClose}
        heading={NO_FREEZES_LEFT}
        footer={
          <>
            <Button label={SEE_PRO} onPress={onSeePro} />
            <Button label={CLOSE} variant="tertiary" onPress={onClose} />
          </>
        }
      >
        <Text style={styles.body}>{freezeNoneBody(freezeRefillDateLabel(lastFreezeUsedAt, timeZone))}</Text>
      </Sheet>
    );
  }
  return (
    <Sheet
      visible={visible}
      onDismiss={onRefuse}
      heading={USE_A_FREEZE_FOR_YESTERDAY_Q}
      footer={
        <>
          <Button label={USE_THE_FREEZE} onPress={onUseFreeze} submitting={submitting} />
          <Button label={NO_LET_IT_RESET} variant="tertiary" onPress={onRefuse} />
        </>
      }
    >
      <Text style={styles.body}>
        {typeof restoredStreakDays === "number" ? freezeOfferBody(restoredStreakDays, remaining) : null}
      </Text>
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
});
