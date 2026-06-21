/**
 * Shared OnboardingFlowV2 primitives. Colors come exclusively from the OBV2
 * token map (DS_COLORS_V2 under the hood) — no raw hex.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { OBV2_COLOR, OBV2_RADIUS } from "./theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export function PrimaryButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable
      style={[styles.btn, styles.btnPrimary, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      {icon}
      <Text style={[styles.btnText, styles.btnTextOnFill]}>{label}</Text>
    </Pressable>
  );
}

export function DarkButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable
      style={[styles.btn, styles.btnDark, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.btnText, styles.btnTextOnFill]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable
      style={[styles.btn, styles.btnGhost, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.btnText, styles.btnTextInk]}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({
  label,
  emphasis,
  onPress,
}: {
  label: string;
  emphasis?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={styles.textLinkWrap}>
      <Text style={styles.textLink}>
        {label}
        {emphasis ? <Text style={styles.textLinkEmphasis}> {emphasis}</Text> : null}
      </Text>
    </Pressable>
  );
}

/** Three-segment progress bar for the "Why" intro sequence. */
export function ProgressBar({ done, total = 3, style }: { done: number; total?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.pbar, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.pSeg, i < done && styles.pSegDone]} />
      ))}
    </View>
  );
}

export function Kicker({ children }: { children: string }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    borderRadius: OBV2_RADIUS.button,
    paddingVertical: 17,
    minHeight: 56,
  },
  btnPrimary: { backgroundColor: OBV2_COLOR.orange },
  btnDark: { backgroundColor: OBV2_COLOR.blackBtn },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: OBV2_COLOR.hair },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  btnTextOnFill: { color: OBV2_COLOR.onDark },
  btnTextInk: { color: OBV2_COLOR.ink },
  textLinkWrap: { width: "100%", paddingVertical: 14, alignItems: "center" },
  textLink: { fontSize: 15, fontWeight: "600", color: OBV2_COLOR.ink2, textAlign: "center" },
  textLinkEmphasis: { color: OBV2_COLOR.orangeInk },
  pbar: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  pSeg: { height: 5, borderRadius: 3, backgroundColor: OBV2_COLOR.progressEmpty, flex: 1 },
  pSegDone: { backgroundColor: OBV2_COLOR.orange },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: OBV2_COLOR.orangeInk,
  },
});
