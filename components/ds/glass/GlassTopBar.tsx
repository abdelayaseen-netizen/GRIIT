/**
 * Build 92 01.5 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/GlassTopBar.tsx.
 * Transparent at scroll 0; thin glass (or the fallback) fades in over the first 8 pt.
 * The title is a human name ("Posts", the challenge name), never a route. Long titles
 * ellipsize on one line; the subtitle sits underneath.
 */
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, MoreHorizontal } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { TOP_BAR_GLASS_IN_PT } from "@/lib/glass";
import { GlassSurface } from "./GlassSurface";

export const TOP_BAR_ROW_HEIGHT = 52;

export type GlassTopBarProps = {
  title: string;
  subtitle?: string;
  /** Scroll offset of the list underneath. Drive it with Animated.event on onScroll. */
  scrollY: Animated.Value;
  onBack: () => void;
  onMore?: () => void;
  testID?: string;
};

export function GlassTopBar({ title, subtitle, scrollY, onBack, onMore, testID }: GlassTopBarProps) {
  const insets = useSafeAreaInsets();
  const opacity = scrollY.interpolate({
    inputRange: [0, TOP_BAR_GLASS_IN_PT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]} pointerEvents="box-none" testID={testID}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
        <GlassSurface kind="thin" hairline="bottom" style={StyleSheet.absoluteFill} />
      </Animated.View>
      <View style={styles.row}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" style={styles.btn}>
          <ChevronLeft size={24} color={DS_V3.color.textPrimary} />
        </Pressable>
        <View style={styles.mid}>
          <Text numberOfLines={1} style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onMore ? (
          <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel="More" style={styles.btn}>
            <MoreHorizontal size={22} color={DS_V3.color.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.btn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, top: 0, zIndex: 20 },
  row: {
    height: TOP_BAR_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_V3.space.xs,
  },
  btn: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1, minWidth: 0, alignItems: "center" },
  title: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
});

export default GlassTopBar;
