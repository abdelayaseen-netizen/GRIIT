import React from "react";
import { StyleSheet, Text } from "react-native";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";
import { DS_V3 } from "@/lib/design-system";

type Props = {
  visible?: boolean;
  onDiscard: () => void;
  onKeep: () => void;
};

export function DiscardPhotoModal({ visible = true, onDiscard, onKeep }: Props) {
  return (
    <Sheet
      visible={visible}
      onDismiss={onKeep}
      heading="Discard photo?"
      footer={
        <>
          <Button label="Discard" destructive onPress={onDiscard} />
          <Button label="Keep photo" variant="tertiary" onPress={onKeep} />
        </>
      }
    >
      <Text style={styles.body}>You&apos;ll lose this photo.</Text>
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
