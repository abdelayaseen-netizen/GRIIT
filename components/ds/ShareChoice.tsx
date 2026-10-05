import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

export type ShareState = "unanswered" | "shared" | "kept" | "failed";

function ChoiceButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.btn} accessibilityRole="button">
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

/** No answer means private. */
export function ShareChoice({
  state,
  isPhoto,
  onShare,
  onKeep,
  onUndo,
  onRetry,
}: {
  state: ShareState;
  isPhoto: boolean;
  onShare: () => void;
  onKeep: () => void;
  onUndo: () => void;
  onRetry: () => void;
}) {
  if (state === "shared") {
    return (
      <View style={styles.row}>
        <CheckCircle2 size={18} color={DS_V3.color.textPrimary} />
        <Text style={styles.line}>Shared to the feed.</Text>
        <Pressable onPress={onUndo} style={styles.undo} accessibilityRole="button">
          <Text style={styles.btnText}>Undo</Text>
        </Pressable>
      </View>
    );
  }
  if (state === "kept") {
    return (
      <View style={styles.row}>
        <Lock size={18} color={DS_V3.color.textPrimary} />
        <Text style={styles.line}>Kept private. Share it later from Profile, Proofs.</Text>
      </View>
    );
  }
  if (state === "failed") {
    return (
      <View style={styles.row}>
        <AlertCircle size={18} color={DS_V3.color.textPrimary} />
        <Text style={styles.line}>Couldn’t share. It’s still private.</Text>
        <ChoiceButton label="Try again" onPress={onRetry} />
      </View>
    );
  }
  return (
    <View style={styles.stack}>
      <View style={styles.pair}>
        <ChoiceButton label={isPhoto ? "Share to the feed" : "Share as a card"} onPress={onShare} />
        <ChoiceButton label="Keep it to the record" onPress={onKeep} />
      </View>
      <Text style={styles.hint}>No answer keeps it private.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: DS_V3.space.sm },
  pair: { flexDirection: "row", gap: DS_V3.space.sm },
  btn: {
    flex: 1,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  hint: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm, minHeight: DS_V3.size.tap },
  line: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary, flex: 1 },
  undo: { minHeight: DS_V3.size.tap, justifyContent: "center" },
});
