/**
 * Shared OnboardingFlowV2 primitives. Colors come exclusively from the OBV2
 * token map (DS_COLORS_V2 under the hood) — no raw hex.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import {
  ONBOARDING_V2_PROGRESS_SEGMENTS,
  v2ProgressLabel,
  v2SegmentFilled,
  type OnboardingV2Step,
} from "@/lib/onboarding-v2-routing";
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
      style={[styles.btn, styles.btnPrimary, disabled && styles.btnDisabledPrimary]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      {icon}
      <Text style={[styles.btnText, styles.btnTextOnFill, disabled && styles.btnTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Geometric ii mark — notification icon and welcome. Never an emoji. */
export function LogoMark({ size = "icon" }: { size?: "icon" | "hero" }) {
  const icon = size === "icon";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: icon ? 3 : 10,
      }}
      accessibilityLabel="GRIIT"
    >
      {[0, 1].map((i) => (
        <View key={i} style={{ alignItems: "center" }}>
          <View
            style={{
              width: icon ? 4 : 24,
              height: icon ? 4 : 24,
              borderRadius: icon ? 1 : 4,
              backgroundColor: OBV2_COLOR.orange,
              marginBottom: icon ? 2 : -12,
            }}
          />
          <View
            style={{
              width: icon ? 4 : 24,
              height: icon ? 14 : 112,
              borderRadius: icon ? 1 : 4,
              backgroundColor: OBV2_COLOR.orange,
            }}
          />
        </View>
      ))}
    </View>
  );
}

export function DarkButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable
      style={[styles.btn, styles.btnDark, disabled && styles.btnDisabledFaint]}
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
      style={[styles.btn, styles.btnGhost, disabled && styles.btnDisabledFaint]}
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

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      style={styles.backBtn}
    >
      <ChevronLeft size={24} color={OBV2_COLOR.ink} strokeWidth={2} />
    </Pressable>
  );
}

/** Shared nav: 44pt back + seven progress segments. Hidden by the flow on welcome. */
export function FlowChrome({ step, onBack }: { step: OnboardingV2Step; onBack: () => void }) {
  const label = v2ProgressLabel(step);
  return (
    <View style={styles.chrome}>
      <BackButton onPress={onBack} />
      <View style={styles.segs} accessibilityRole="progressbar" accessibilityLabel={label}>
        {Array.from({ length: ONBOARDING_V2_PROGRESS_SEGMENTS }, (_, i) => (
          <View key={i} style={[styles.seg, v2SegmentFilled(step, i + 1) && styles.segOn]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
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
    minHeight: 60,
  },
  btnPrimary: { backgroundColor: OBV2_COLOR.orange },
  btnDark: { backgroundColor: OBV2_COLOR.blackBtn },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: OBV2_COLOR.hair },
  btnDisabledPrimary: { backgroundColor: OBV2_COLOR.track, opacity: 1 },
  btnDisabledFaint: { opacity: 0.5 },
  btnTextDisabled: { color: OBV2_COLOR.ink3 },
  btnText: { fontSize: 18, fontWeight: "500", letterSpacing: 0 },
  btnTextOnFill: { color: OBV2_COLOR.onDark },
  btnTextInk: { color: OBV2_COLOR.ink },
  textLinkWrap: { width: "100%", paddingVertical: 14, alignItems: "center" },
  textLink: { fontSize: 15, fontWeight: "500", color: OBV2_COLOR.ink2, textAlign: "center" },
  textLinkEmphasis: { color: OBV2_COLOR.orangeInk },
  pbar: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  pSeg: { height: 5, borderRadius: 3, backgroundColor: OBV2_COLOR.progressEmpty, flex: 1 },
  pSegDone: { backgroundColor: OBV2_COLOR.orange },
  kicker: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: OBV2_COLOR.orangeInk,
  },
  backBtn: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  chrome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 20,
  },
  segs: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 20 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: OBV2_COLOR.progressEmpty },
  segOn: { backgroundColor: OBV2_COLOR.orange },
  stepLabel: {
    minWidth: 46,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    color: OBV2_COLOR.mutedWarm,
    textAlign: "right",
  },
});
