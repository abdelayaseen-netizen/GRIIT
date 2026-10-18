/**
 * Build 92 01.1 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/GlassSurface.tsx.
 * Floating chrome only: tab bar, top bars, bottom sheets, floating action bar, toasts.
 * Never on content, never glass on glass.
 *
 * Default path (flag off, iOS < 26, Reduce Transparency): solid #1A1A1A with a 1 px
 * #2A2A2A hairline. Flag on: the Part 0 tint. The native material (`expo-glass-effect`
 * GlassView) is not installed in this build; see "Needs Yaseen" in docs/reports/build92.md.
 * When it is installed, replace the tinted View below with
 * `<GlassView glassEffectStyle="regular" tintColor={GLASS[kind].tint} />`.
 */
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { GLASS, GLASS_FALLBACK, type GlassKind } from "@/lib/glass";
import { useGlassEnabled } from "./useGlass";

export type GlassSurfaceProps = ViewProps & {
  kind?: GlassKind;
  /** Sheets only: draw the fallback hairline on the top edge only. */
  hairline?: "all" | "top" | "bottom" | "none";
};

export function GlassSurface({ kind = "chrome", hairline = "all", style, children, ...rest }: GlassSurfaceProps) {
  const on = useGlassEnabled();
  if (!on) {
    return (
      <View style={[styles.fallback, hairlineStyle(hairline), style]} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <View style={[{ backgroundColor: GLASS[kind].tint }, edgeStyle(kind), style]} {...rest}>
      {children}
    </View>
  );
}

function hairlineStyle(h: NonNullable<GlassSurfaceProps["hairline"]>) {
  const w = GLASS_FALLBACK.hairlineWidth;
  if (h === "all") return { borderWidth: w };
  if (h === "top") return { borderTopWidth: w };
  if (h === "bottom") return { borderBottomWidth: w };
  return null;
}

function edgeStyle(kind: GlassKind) {
  const t = GLASS[kind];
  if ("edgeTop" in t) return { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.edgeTop };
  return { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.edgeBottom };
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: GLASS_FALLBACK.fill,
    borderColor: GLASS_FALLBACK.hairline,
  },
});

export default GlassSurface;
