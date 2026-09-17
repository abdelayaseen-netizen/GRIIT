import React from "react";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";

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
    />
  );
}
