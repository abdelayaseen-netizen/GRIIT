import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle, CheckCircle2, Lock, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { SHARE } from "@/lib/copy";

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
  photoUri,
}: {
  state: ShareState;
  isPhoto: boolean;
  onShare: () => void;
  onKeep: () => void;
  onUndo: () => void;
  onRetry: () => void;
  photoUri?: string | null;
}) {
  if (state === "shared") {
    return (
      <View style={styles.row}>
        <CheckCircle2 size={18} color={DS_V3.color.textPrimary} />
        <Text style={styles.line}>{SHARE.shared}</Text>
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
  if (isPhoto) {
    return (
      <View style={styles.stack}>
        <Pressable onPress={onShare} style={styles.photoPill} accessibilityRole="button" accessibilityLabel={SHARE.cta}>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Share2 size={18} color={DS_V3.color.textPrimary} />}
          <Text style={styles.btnText}>{SHARE.cta}</Text>
        </Pressable>
        <View style={styles.keepRow}>
          <Text style={styles.hint}>{SHARE.privacy}</Text>
          <Pressable onPress={onKeep} accessibilityRole="button" accessibilityLabel={SHARE.keep}>
            <Text style={styles.keep}>{SHARE.keep}</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.stack}>
      <View style={styles.pair}>
        <ChoiceButton label="Share as a card" onPress={onShare} />
        <ChoiceButton label={SHARE.keep} onPress={onKeep} />
      </View>
      <Text style={styles.hint}>{SHARE.privacy}</Text>
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
  hint: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, flex: 1 },
  photoPill: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: DS_V3.color.textPrimary,
    backgroundColor: DS_V3.color.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  photo: { width: 32, height: 40, borderRadius: 6 },
  keepRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  keep: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm, minHeight: DS_V3.size.tap },
  line: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary, flex: 1 },
  undo: { minHeight: DS_V3.size.tap, justifyContent: "center" },
});
