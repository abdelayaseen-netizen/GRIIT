import React from "react";
import { Pressable, Text, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { styles } from "../taskFlowStyles";

type Props = {
  taskName: string;
  onDidIt: () => void;
  onNotYet: () => void;
};

export function AskStep({ taskName, onDidIt, onNotYet }: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>Did you do it today?</Text>
      <Text style={{ fontSize: 16, color: DS_COLORS_V2.text.muted }}>{taskName}</Text>
      <Text style={styles.switchSub}>Self-reported. Nothing is checked.</Text>
      <Pressable onPress={onDidIt} accessibilityRole="button" accessibilityLabel="I did it" style={styles.inkBtn}>
        <Text style={styles.inkBtnText}>I did it</Text>
      </Pressable>
      <Pressable onPress={onNotYet} accessibilityRole="button" accessibilityLabel="Not yet" style={styles.outlineBtn}>
        <Text style={styles.outlineText}>Not yet</Text>
      </Pressable>
    </View>
  );
}
