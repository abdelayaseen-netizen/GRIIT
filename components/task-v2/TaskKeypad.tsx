import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";
import {
  formatKeypadBuffer,
  parseKeypadBuffer,
  pushKeypadDigit,
  type KeypadMask,
} from "@/lib/keypad-masks";

export function TaskKeypad({
  label,
  mask,
  buffer,
  onBuffer,
  onDone,
}: {
  label: string;
  mask: KeypadMask;
  buffer: string;
  onBuffer: (next: string) => void;
  onDone: (value: number | null) => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.draft}>{formatKeypadBuffer(buffer, mask)}</Text>
      </View>
      <View style={styles.grid}>
        {keys.map((d) => (
          <Pressable
            key={d}
            onPress={() => onBuffer(pushKeypadDigit(buffer, d, mask))}
            accessibilityRole="button"
            accessibilityLabel={d}
            style={({ pressed }) => [styles.key, pressed && styles.pressed]}
          >
            <Text style={styles.keyText}>{d}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => onBuffer("")}
          accessibilityRole="button"
          accessibilityLabel="Clear"
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <Text style={styles.word}>Clear</Text>
        </Pressable>
        <Pressable
          onPress={() => onBuffer(pushKeypadDigit(buffer, "0", mask))}
          accessibilityRole="button"
          accessibilityLabel="0"
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <Text style={styles.keyText}>0</Text>
        </Pressable>
        <Pressable
          onPress={() => onBuffer(buffer.slice(0, -1))}
          accessibilityRole="button"
          accessibilityLabel="Delete"
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <Text style={styles.word}>Del</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => onDone(parseKeypadBuffer(buffer, mask))}
        accessibilityRole="button"
        accessibilityLabel="Done"
        style={({ pressed }) => [styles.done, pressed && { backgroundColor: DS_COLORS_V2.text.secondary }]}
      >
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%", paddingTop: 8 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  label: { fontSize: 11, letterSpacing: 0.8, color: DS_COLORS_V2.text.mutedWarm },
  draft: { fontSize: 26, fontWeight: "500", fontVariant: ["tabular-nums"], color: DS_COLORS_V2.text.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  key: {
    width: "31%",
    flexGrow: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: DS_COLORS_V2.surface.card,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
  keyText: { fontSize: 20, fontWeight: "500", color: DS_COLORS_V2.text.primary },
  word: { fontSize: 13, color: DS_COLORS_V2.text.muted },
  done: {
    marginTop: 12,
    height: 56,
    borderRadius: 16,
    backgroundColor: DS_COLORS_V2.text.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
});
