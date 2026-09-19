import React from "react";
import { Text, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ControlPill from "@/components/ds/ControlPill";
import { styles } from "../taskFlowStyles";

type Fail = {
  eyebrow: string;
  headline: string;
  body: string;
  retryNote?: string;
  primaryAction: string;
  primaryLabel: string;
};

type Props = {
  fail: Fail;
  hasPhoto: boolean;
  onPrimary: () => void;
  onKeepLater: () => void;
};

export function FailedStep({ fail, hasPhoto, onPrimary, onKeepLater }: Props) {
  return (
    <View style={styles.body}>
      <Text style={[styles.eyebrowInk, { color: DS_COLORS_V2.semantic.dangerInk }]}>{fail.eyebrow}</Text>
      <Text style={styles.title}>{fail.headline}</Text>
      <Text style={styles.bodyText}>{fail.body}</Text>
      {fail.retryNote ? <Text style={styles.disclosure}>{fail.retryNote}</Text> : null}
      <Button label={fail.primaryLabel} onPress={onPrimary} />
      {fail.primaryAction === "retry" && hasPhoto ? (
        <ControlPill label="Keep it for later" icon="x" onPress={onKeepLater} />
      ) : null}
    </View>
  );
}
